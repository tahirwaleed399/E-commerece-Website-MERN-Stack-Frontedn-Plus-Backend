// module.exports = function catchAsyncErrors(asyncFunctionRequest){
// console.log('wrapper Function Called ');

// return function(req, res ,next){
//     console.log('returned function called');
//     asyncFunctionRequest(req, res ,next).catch(next)
// //  Promise.resolve(asyncFunctionRequest).catch(next) ;  
// }

// }


module.exports = (theFunc) => {

  return  (req, res, next) => {
        Promise.resolve(theFunc(req, res, next)).catch(next);
      };
      
} 