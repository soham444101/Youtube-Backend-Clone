// import { message } from "statuses"

const asynHandaler = (reqhandler) => {
    return (req, res, next) => {
        Promise.resolve(reqhandler(req, res, next)).catch((err) =>
            next(err))
    }
}
// Above WE Done By Following Format also 

// const asynHandale =()  => {}
// const asynHandale =(func) =>  ()  => {}
// const asynHandale =(func) => { asyn ()=>{}   }
// Higher Order function We Can pass funtion Also in it.
// const asynHandale = (fn) => {
//     async (req,res,next) => {
//         try {
   
//              await fu(res,req,next)
//         }
//         catch(error){
//             res.status((Error.code || 500).json(
//                 {
//                     success: false,
//                     message: Error.message
//                 }
//             ))
//         }
//     }
// }



export { asynHandaler }