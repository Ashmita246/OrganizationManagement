// Custom middleware to check if user is authenticated
function forwardAuth(req, res, next) {
   if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
    next();
  } else {
     res.redirect('./login'); 
  }
} 
function backwardAuth(req, res, next){
  console.log(req.isAuthenticated());
  // Check if user object exists on request (assuming it's set by Passport)
  if (req.isAuthenticated()) {
     next();
  } else {
     res.redirect('/org/login'); // You can customize the response as needed
  }
} 

function orgLogin (req, res, next) {
  // Check if user is authenticated
  console.log('org ko auth middleware');
  if (req.isAuthenticated()&&req.user.role=='org') {
    // If user is authenticated, redirect to dashboard or another page
    return res.redirect('/org/dashboard');
  }
   next();
}

function preventRenderingLoginPageEmp(req, res, next) {
  // Check if user is authenticated
  if (req.isAuthenticated()&&req.user.role=='emp') {
    // console.log(req.user);
    // If user is authenticated, redirect to dashboard or another page
    return res.redirect('/emp/dashboard');
    
  }
  // If user is not authenticated, proceed to render login page
  next();
}
 
module.exports = { forwardAuth, backwardAuth, orgLogin,preventRenderingLoginPageEmp};
