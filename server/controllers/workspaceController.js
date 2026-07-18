import prisma from "../configs/prisma.js";

// Get all workspaces for logged-in user
export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId } = await req.auth();

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true,
                                comments: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                        members: {
                            include: {
                                user: true,
                            },
                        },
                        owner: true,
                    },
                },
                owner: true,
            },
        });

        return res.json({ workspaces });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: e.code || e.message,
        });
    }
};

// Add member to workspace
export const addMember = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { email, role, workspaceId, message } = req.body;

        // Validate required fields
        if (!email || !workspaceId || !role) {
            return res.status(400).json({
                message: "Missing required parameters",
            });
        }

        // Validate role
        if (!["ADMIN", "MEMBER"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        // Check if invited user exists
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Fetch workspace with members
        const workspace = await prisma.workspace.findUnique({
            where: {
                id: workspaceId,
            },
            include: {
                members: true,
            },
        });

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        //check creator has a admin role

        const adminMember = workspace.members.find(
    (member) => member.userId === userId && member.role === "ADMIN"
);

if (!adminMember) {
    return res.status(403).json({
        message: "You are not an Admin",
    });
}
     

        //check if user is already member

        const existingMember=workspace.members.find((member)=>member.userId==user.id);
        if(existingMember){
        return res.status(400).json({message: "user is already member"})

        }


        const member= await prisma.workspaceMember.create({
            data:{
                userId:user.id,
                workspaceId,
                role,
                message
            }
        })

    return res.json({member,message: "member added successfully"})




    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: e.code || e.message,
        });
    }
};