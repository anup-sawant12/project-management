import prisma from "../configs/prisma.js";

// ======================= CREATE PROJECT =======================
export const createProject = async (req, res) => {
  try {
    const { userId } = req.auth();

    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;

    // Check workspace
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check admin permission
    const isAdmin = workspace.members.some(
      (member) => member.userId === userId && member.role === "ADMIN"
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }

    // Find team lead
    const teamLead = await prisma.user.findFirst({
      where: {
        OR: [
          { email: team_lead },
          { id: team_lead },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!teamLead) {
      return res.status(404).json({ message: "Team lead not found" });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        status,
        priority,
        progress,
        team_lead: teamLead.id,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    // Add members
    if (team_members?.length > 0) {
      const membersToAdd = [];

      workspace.members.forEach((member) => {
        if (team_members.includes(member.user.email)) {
          membersToAdd.push(member.user.id);
        }
      });

      if (membersToAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: membersToAdd.map((memberId) => ({
            projectId: project.id,
            userId: memberId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const projectWithMembers = await prisma.project.findUnique({
      where: {
        id: project.id,
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
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
      },
    });

    return res.json({
      project: projectWithMembers,
      message: "Project created successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.code || e.message,
    });
  }
};

// ======================= UPDATE PROJECT =======================
export const updateProject = async (req, res) => {
  try {
    const { userId } = req.auth();

    const {
      id,
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isAdmin = workspace.members.some(
      (member) => member.userId === userId && member.role === "ADMIN"
    );

    if (!isAdmin && project.team_lead !== userId) {
      return res.status(403).json({
        message: "You don't have permission to update this project",
      });
    }

    const teamLead = await prisma.user.findFirst({
      where: {
        OR: [
          { email: team_lead },
          { id: team_lead },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!teamLead) {
      return res.status(404).json({
        message: "Team lead not found",
      });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: {
        workspaceId,
        name,
        description,
        status,
        priority,
        progress,
        team_lead: teamLead.id,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    // Update project members
    if (team_members) {
      await prisma.projectMember.deleteMany({
        where: {
          projectId: id,
        },
      });

      const membersToAdd = [];

      workspace.members.forEach((member) => {
        if (team_members.includes(member.user.email)) {
          membersToAdd.push(member.user.id);
        }
      });

      if (membersToAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: membersToAdd.map((memberId) => ({
            projectId: id,
            userId: memberId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return res.json({
      project: updatedProject,
      message: "Project updated successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.code || e.message,
    });
  }
};

// ======================= ADD MEMBER =======================
export const addMember = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { projectId } = req.params;

    const { email } = req.body;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.team_lead !== userId) {
      return res.status(403).json({
        message: "Only project lead can add members",
      });
    }

    const existingMember = project.members.find(
      (member) => member.user.email === email
    );

    if (existingMember) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

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

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
      },
    });

    return res.json({
      member,
      message: "Member added successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.code || e.message,
    });
  }
};