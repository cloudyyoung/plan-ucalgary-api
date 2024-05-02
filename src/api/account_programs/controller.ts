
import { CatalogProgramModel } from '../catalog_programs/models';
import { Request, Response } from 'express';
import { jwtDecode } from "jwt-decode";
import JwtContent from '../account_courses/interfaces'
import { Accounts } from '../accounts/models';

export const getAccountPrograms = async (req: Request, res: Response) => {

  try {
    const { token } = req.body;
    const decoded = jwtDecode<JwtContent>(token);
    const id = decoded.payload.user.id;
    console.log(id)
    const user = await Accounts.findOne({ "_id": id });
    if (user){
      const programIds = user.programs;
      const ProgramList = await CatalogProgramModel.find({ '_id': { $in: programIds } })
      console.log(ProgramList)      
      return res.status(200).json({ "Programs": ProgramList });
    } else {
      return res.status(400).json({ "error": "Cannot find the user." });
    }

    
  } catch (error) {
    console.log(error)
    return res.status(400).json({ "error": "Something went wrong." });
  }


};



export const AddAccountPrograms = async (req: Request, res: Response) => {
  try {
    const { token, program_id } = req.body;
    const decoded = jwtDecode<JwtContent>(token);
    const account_id = decoded.payload.user.id;
    console.log(account_id, program_id, decoded)

    const checkAccount = await Accounts.findById({ "_id": account_id });
    if (!checkAccount) {
      return res.status(400).json({ "error": "Account does not exist." });
    }

    const checkProgram = await CatalogProgramModel.findById({ "_id": program_id });
    if (!checkProgram) {
      return res.status(400).json({ "error": "Course does not exist." });
    }

    if (checkAccount.programs.some(x => x === program_id.toString())){
      return res.status(400).json({ "error": "You are in the program already." });
    }

    checkAccount.programs.push(program_id);

    Accounts.updateOne({"_id": account_id},{$set:{programs:checkAccount.programs}}, (err: any,doc: any)=>{
      if (err){
        console.log(err)
      }
      console.log(doc)
    })

    return res.status(200).json({ "message": "You successfully added the program." });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ "error": "Something went wrong." });
  }

};
