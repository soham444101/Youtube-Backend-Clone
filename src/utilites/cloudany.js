import {v2 as cloudinary}from "cloudinary"
import { error } from "console";
import { response } from "express";
import fs from "fs"// already pacakge contain to create deleat and other file things(DOcumentation Read )
           
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET 
});

const uplodeCloudinary = async (LOcalfilePath)=>{
try{
  if(!LOcalfilePath) return null

  // uplode file to cloudinar
  const responce = await cloudinary.uploader.upload(
    LOcalfilePath,{
      resource_type :'auto '
    })
    // file uplode succefully
    console.log("file uplode to cloudinary ", responce.url)
    return responce
}
catch(errror){
  fs.unlinkSync(LOcalfilePath) // fs contain in node.js
  // remove local save temporary files file
  return null;
}
}
const Deleat_Cloudinary_File = (async(public_id,resource_Type="image")=>{
// Public_id Exits Or not validation
//destory from cloudinary
// validate 
//responce

try {
  if (!public_id) {
    return null;
  }
  
  //destory from cloudinary
  const Responce =await cloudinary.uploader.destroy(
    public_id =public_id,{
  resource_type :resource_Type
    }
  );
  console.log("Responce",Responce);
  console.log("File Deleat Succesfully");
  return Responce;
  } catch (error) {
   console.log("Deletion of File Fails",error)
   return null
}

}
)
export{uplodeCloudinary,Deleat_Cloudinary_File};
// cloudinary given example for uploding on it.
// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });

