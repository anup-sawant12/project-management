//add comment

import prisma from "../configs/prisma.js";

export const addComment=async (req,res)=>{
    try{
        const {userId}=req.auth()
        const {content,taskId}=req.body

        //check user is project member
        const task= await prisma.task.findUnique({
            where:{
                id:taskId
            },
        })

        if (!task) {
    return res.status(404).json({
        message: "Task not found"
    });
}

        const project=await prisma.project.findUnique({
            where:{
                id:task.projectId
            },
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

        const isMember = project.members.some((member) => member.userId === userId);
        const isTeamLead = project.team_lead === userId;

        if(!isMember && !isTeamLead){
            return res.status(403).json({message:"you are not part of this project"})
        }

        const comment=await prisma.comment.create({
            data:{
                taskId,
                content,
                userId
            },
            include:{
                user:true
            }
        })

        res.json({comment})

    }catch(e){
    return res.status(500).json({
      message: e.code || e.message,
    });
    }
}

//get comments for task

export const getTaskComments= async (req,res)=>{
    try{
        const {taskId}=req.params
        const comments=await prisma.comment.findMany({
            where:{
                taskId
            },
            include:{
                user:true
            }
        })

        res.json({comments})

    }catch(e){
         return res.status(500).json({
      message: e.code || e.message,
    });
    }
}