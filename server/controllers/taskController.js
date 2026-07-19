//create task

import prisma from "../configs/prisma.js";





export const createTask=async(req,res)=>{
    try{
        const{userId}=req.auth()
        const{projectId,title,description,type,status,priority,
            assigneeId,due_date}=req.body;

            const origin=req.get('origin')

            //check if user has admin role for project
            const project=await prisma.project.findUnique   ({
                where:{
                    id:projectId
                }
                ,
                include:{
                    members:{
                        include:{
                            user:true
                        }
                    }
                    
                }

                 
                
            })

            if(!project){
                return res.status(404).json({message:"Project not found"})
            }
            else if(project.team_lead!==userId){
                return res.status(403).json({message:"You are not admin"})
            }
            else if(assigneeId && !project.members.find((member)=>member.user.id===assigneeId)){
                return res.status(403).json({message:"assignee is not  a member of project or workspace"})
            }

            const task=await prisma.task.create({
                data:{
                    projectId,
                    title,
                    description,
                    priority,
                    assigneeId,
                    status,
                    due_date:new Date(due_date)

                }
            })

            const taskWithAssignee=await prisma.task.findUnique({
                where:{
                    id:task.id,

                },
                include:{
                    assignee:true
                }
            })
            res.json({task: taskWithAssignee, message:"task created successfully"})



        

    }catch(e){
        console.log(e);
        return res.status(500).json({message: e.code || e.message})
    }
}

//update the task
export const updateTask=async(req,res)=>{
    try{

        const task=await prisma.task.findUnique({
            where:{
                id:req.params.id
                }
        })

        if(!task){
            return res.status(404).json({message:"task not found"})
        }

        const{userId}=req.auth()
        

            
            const project=await prisma.project.findUnique   ({
                where:{
                    id:task.projectId
                }
                ,
                include:{
                    members:{
                        include:{
                            user:true
                        }
                    }
                    
                }

                 
                
            })

            if(!project){
                return res.status(404).json({message:"Project not found"})
            }
            else if(project.team_lead!==userId){
                return res.status(403).json({message:"You are not admin"})
            }

            const updatedTask=await prisma.task.update({
                where:{
                    id:req.params.id
                },
                data: req.body
                


            })
            
 res.json({task: updatedTask, message:"task updated successfully"})

          
           



        

    }catch(e){
        console.log(e);
        return res.status(500).json({message: e.code || e.message})
    }
}

//delete task

export const deleteTask=async(req,res)=>{
    try{

        

        const{userId}=req.auth()
        
        const {taskIds}=req.body

        const tasks =await prisma.task.findMany({
            where:{
                id:{in:taskIds}
            }
        })

        if(tasks.length===0){
            return res.status(404).json({message:"task not found"})
        }



            
            const project=await prisma.project.findUnique   ({
                where:{
                    id:tasks[0].projectId
                }
                ,
                include:{
                    members:{
                        include:{
                            user:true
                        }
                    }
                    
                }

                 
                
            })

            if(!project){
                return res.status(404).json({message:"Project not found"})
            }
            else if(project.team_lead!==userId){
                return res.status(403).json({message:"You are not admin"})
            }



            await prisma.task.deleteMany({
                where:{
                    id:{in:taskIds}
                }
            })
            


          
           
             res.json({ message:"task deleted successfully"})


        

    }catch(e){
        console.log(e);
        return res.status(500).json({message: e.code || e.message})
    }
}