var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const initializePassport = require('./passportConfig.js')
const methodOverride = require('method-override')
app.use(methodOverride('_method'));
initializePassport(passport);

// Use the pg-format library to support bulk inserts
const format = require('pg-format');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);

// Connect with Postgres
const { Client } = require('pg');
const e = require('express');
const pg = new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ethical_eating",
    // ssl: {
    //   rejectUnauthorized: false
    // }
});
pg.connect();

app.use(flash());
app.use(session({
  secret : 'super secret key',
  resave : false,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/',function(req,res,next){
    let context = {};
    context.user = req.user || null  // req.user exists when a user is logged in
    context.title = "Home";
    res.render('home', context);
});

app.get('/build',function(req,res,next){
  let context = {};
  context.user = req.user || null  // req.user exists when a user is logged in
  context.title = "Build a Recipe";
  res.render('build', context);
});

app.get('/faq',function(req,res,next){
  let context = {};
  context.user = req.user || null  // req.user exists when a user is logged in
  context.title = "FAQ";
  res.render('faq', context);
});

app.post('/saveRecipe', function (req, res, next) {
  if (!req.user) {
    res.send({error: 'You have to log in first!'});
  }

  else {
    // Insert the recipe into the recipe table
    let name = req.body['name'];
    let ingredients = req.body['ingredients'];

    // Construct the query
    let insert_recipe_query = {
      text: `insert into recipe (name, owner_id, public) values ($1, $2, False) returning *`,
      values: [name, req.user.id]
    };

    pg.query(insert_recipe_query, (err, result) => {
      if (err) {
        next(err);
        return;
      }

      let recipe_id = result.rows[0].id;
      // Construct the insert query
      let insert_ingredients_query = `insert into recipe_ingredient (recipe_id, ingredient_id) values %L`;
      var values = [];

      // Loop through each ingredient to append the recipe and ingredient ID pairs to the values array
      for (let ingredient_id in ingredients) {
        values.push([recipe_id, ingredient_id]);
      }

      // Run the bulk insert query
      pg.query(format(insert_ingredients_query, values), (err, result) => {
        if (err) {
          next(err);
        }

        // Send back the name and ID of the newly inserted recipe to indicate success
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({name: name, id: recipe_id}));
      });

    })
  }
});

app.get('/my_recipes', function (req, res, next) {
  let context = {};
  context.user = req.user || null;

  context.title = "My Recipes";

  let query = {
    text: `select r.name as recipename, r.id as recipeid from recipe r where r.owner_id = $1;`,
    values: [req.user.id]
  };

  pg.query(query, (err, result) => {
    if (err) {
      next(err);
      return;
    }

    context.results = result.rows;
    res.render('my_recipes', context);
  })
});

app.get('/recipe', function (req, res, next) {
  let context = {};
  context.user = req.user || null;

  let recipe_id = req.query.id;
  let query = {
    text: `select i.id as ingredientid, i.name as ingredientname, r.name as recipename, r.owner_id as ownerid, r.id as recipeid
           from recipe r
           inner join recipe_ingredient ri on r.id = ri.recipe_id 
           inner join ingredient i on ri.ingredient_id = i.id
           where r.id = $1`,
    values: [recipe_id]
  };

  pg.query(query, (err, result) => {
    if (err) {
      next(err);
      return;
    }
    context.title = result.rows[0].recipename;
    context.results = result.rows;

    let ingredient_ids = [];
    for (let i = 0; i < context.results.length; i++) {
      ingredient_ids.push(context.results[i].ingredientid);
    }

    let problems_query = {
      text: `select i.name as ingredient, p.title as problem, ee.explain as description 
              from ingredient_ethical_problem ip 
              inner join ingredient i on i.id = ip.ingredient_id
              inner join ethical_problem p on p.id = ip.problem_id
              inner join ethical_description ee on ee.id = ip.explain_id
              where i.id = any ($1)`,
      values: [ingredient_ids]
    }

    pg.query(problems_query, (err, result) => {
      if (err) {
        next(err);
        return;
      }

      // add description to ingredients with problems
      for (let i = 0; i < result.rows.length; i++) {
        for (let j = 0; j < context.results.length ; j++) {
          if (result.rows[i].ingredient == context.results[j].ingredientname) {
            context.results[j]["problem"] = result.rows[i]["problem"];
            context.results[j]["description"] = result.rows[i]["description"];
            break;
          }
        }
      }
      
      res.render('recipe', context);
      })
  })
});

app.post('/getRecipeIngredientsWithRecipeId', function (req, res, next) {

  let recipe_id = req.body.id;
  let query = {
    text: `select i.name as ingredientname, r.name as recipename, r.owner_id as ownerid, r.id as recipeid, i.id as ingredientid
           from recipe r
           inner join recipe_ingredient ri on r.id = ri.recipe_id 
           inner join ingredient i on ri.ingredient_id = i.id 
           where r.id = $1`,
    values: [recipe_id]
  };

  pg.query(query, (err, result) => {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows));
  })
});

app.post('/findPrivateRecipeWithName', (req, res, next) => {

  // Check that there is an active user session
  if (!req.user) {
    res.send({error: 'You have to log in first!'});
  }

  let name = req.body.name;
  let owner_id = req.user.id;

  let query = {
    text: `select * from recipe r where name like $1 and owner_id = $2`,
    values: [name, owner_id]
  };

  pg.query(query, (err, result) => {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows));
  })
});

app.delete('/deleteRecipeWithId', async (req, res, next) => {

  let recipe_id = req.body.id;

  // Use a try-catch block to catch errors from async-await
  try {
    // First delete the recipe ingredient entries
    let promise_del_recipe_ingredient = new Promise(function (resolve, reject) {
      let recipe_ingredient_del_query = {
        text: `delete from recipe_ingredient ri where ri.recipe_id = $1 returning *`,
        values: [recipe_id]
      };

      pg.query(recipe_ingredient_del_query, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
    // Wait for the promise to resolve
    let recipe_ingredient_result = await promise_del_recipe_ingredient;

    // Once the first promise resolves (recipe-ingredient entries deleted), then delete the recipe entry
    let promise_del_recipe = new Promise(function (resolve, reject) {
      let recipe_del_query = {
        text: `delete from recipe r where r.id = $1 returning *`,
        values: [recipe_id]
      };
      pg.query(recipe_del_query, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result.rows);
      });
    });
    // Wait for the second promise to resolve
    let recipe_result = await promise_del_recipe;

    // Send the response back to client
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(recipe_result));
  }
  catch (err) {
    next(err);
  }
});

/*
display on category page based on click
*/
app.get('/category/:category',function(req,res,next){
  let context = {};
  context.user = req.user || null  // req.user exists when a user is logged in
  var type = req.params.category;
  context.title = type;

  // Select all from the test_table
  let query = `select r.id as recipeid ,r.name as recipename, c.name as categoryname
                  from category c
                  inner join recipe_category rc on c.id = rc.category_id
                  inner join recipe r on rc.recipe_id = r.id
                  where c.name = $1`
  var inserts = [type];

  pg.query(query, inserts,(err, result) => {
    if(err){
      next(err);
      return;
    }

    context.results = result.rows;
    res.render('category', context);
  });
});

/*
The /getIngredients endpoint returns a list of all ingredients in the database and their IDs
 */
app.post('/getIngredients', function (req, res, next) {

  // Construct the query
  const query = `select * from ingredient i order by name asc`;

  // Run the query and send response
  pg.query(query, function(err, result){
    if(err){
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows));
  });
});

/*
The /getEthicsForIngredientId endpoint returns an ingredient's ethical problem and description
 */
app.post('/getEthicsForIngredientId', function (req, res, next) {
  // Construct the query
  const query = {
    text: `select i.name as ingredient, p.title as problem, ee.explain as description 
          from ingredient_ethical_problem ip 
          inner join ingredient i on i.id = ip.ingredient_id
          inner join ethical_problem p on p.id = ip.problem_id
          inner join ethical_description ee on ee.id = ip.explain_id
          where i.id = $1`,
    values: [req.body["id"]]
  };

  // Run the query and send response
  pg.query(query, function(err, result){
    if(err){
      next(err);
      return;
    }

    let response = {};
    if (result.rows.length) {
      response['problem'] = result.rows[0]['problem'];
      response['description'] = result.rows[0]['description'];
    } else {
      response['problem'] = "None";
      response['description'] = "None";
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.send(response);
  });
});

/*
The /getRecipeByCategory endpoint takes an id of a category as a parameter and returns a list of all the recipes within that category
 */
app.post('/getRecipesByCategoryId', function (req, res, next) {

  // Construct the query
  const query = {
    text: `select r.name as recipeName
          from recipe r 
          inner join recipe_category rc on r.id = rc.recipe_id 
          inner join category c on rc.category_id = c.id
          where c.id = $1`,
    values: [req.body["id"]]
  };
  

  // Run the query and send response
  pg.query(query, function(err, result){
    if(err){
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows));
  });
});

/*
The /getIngredientsByRecipeId endpoint takes an id of a recipe as a parameter and returns a list of all the ingredients for that recipe
 */
app.post('/getIngredientsByRecipeId', function (req, res, next) {

  // Construct the query
  const query = {
    text: `select i.name as ingredientList
          from recipe r
          inner join recipe_ingredient ri on r.id = ri.recipe_id 
          inner join ingredient i on ri.ingredient_id = i.id
          where r.id = $1`,
    values: [req.body["id"]]
  };

  // Run the query and send response
  pg.query(query, function(err, result){
    if(err){
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows));
  });
});

/*
The /getAlternativesForIngredientId endpoint takes the id of an ingredient as parameter and returns as a response
the list of alternatives and list of alternative IDs.
 */
app.post('/getAlternativesForIngredientId', function (req, res, next) {

  // Construct the query
  const query = {
    text: `select alt.name as alternative, alt.id as alternative_id  
            from ingredient i 
            inner join ingredient_alternative ia on i.id = ia.ingredient_id 
            inner join ingredient alt on ia.alternative_id = alt.id 
            where i.id = $1`,
    values: [req.body["id"]]
  };

  // Run the query and send response
  pg.query(query, function(err, result){
    if(err){
      next(err);
      return;
    }

    var response = {};
    response['alternative'] = [];
    response['alternative_id'] = [];

    if (result.rows.length) {
      for (let i = 0; i < result.rows.length; i++) {
        response['alternative'].push(result.rows[i]['alternative']);
        response['alternative_id'].push(result.rows[i]['alternative_id'])
      }
    } else {
      response['alternative'].push("None");
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response));
  });
});

app.post('/register', checkNotAuthenticated, async function(req, res, next) {
  var context = {success: null}
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  let query = `INSERT INTO account (first_name, last_name, email, username, password) VALUES ('${req.body.first_name}', '${req.body.last_name}', '${req.body.email}', '${req.body.username}', '${hashedPassword}');`;
  pg.query(query, (err, result) => {
    if(err){
      next(err);
      return;
    }
    context.success = true
    res.send(context);
  })
});

app.post('/validateUsername', checkNotAuthenticated, function(req, res, next) {
  var context = {success: null}
  let query = `SELECT account.username FROM account where account.username='${req.body.username}'`;
  pg.query(query, (err, result) => {
    if(err){
      next(err);
      return;
    }
    // if the select finds something.
    if (result.rowCount > 0) {
      context.success = false
    } else {
      context.success = true
    }
    res.send(context);
  })
});

app.post('/validateEmail', checkNotAuthenticated, function(req, res, next) {
  var context = {success: null}
  let query = `SELECT account.email FROM account where account.email='${req.body.email}'`;
  pg.query(query, (err, result) => {
    if(err){
      next(err);
      return;
    }
    // if the select finds something.
    if (result.rowCount > 0) {
      context.success = false
    } else {
      context.success = true
    }
    res.send(context);
  })
});

// DISPLAY LOGIN PAGE
app.get('/login', checkNotAuthenticated, function(req,res,next){
  let context = {};
  context.title = "Login";
  res.render('login', context);
});

// LOGIN Attempt
app.post('/login', checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
  })
);

// LOGOUT
app.delete('/logout', checkAuthenticated, function(req,res){
  req.logOut();  // removes the session
  res.redirect('/login');
})

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()){ // req.isAuthenticated() returns true if there is a user that is authenticated
    return next();
  }
  res.redirect('/login');  // redirect to login page if a user is not authenticated
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()){
    return res.redirect('/');  // redirect to home page if a user is already authenticated
  }
  next();
}

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
