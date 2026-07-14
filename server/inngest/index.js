import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create Inngest client
export const inngest = new Inngest({
  id: "project-management",
});

// ---------------------------
// Create User
// ---------------------------
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-creation",
    triggers: [
      {
        event: "clerk/user.created",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url,
      },
    });
  }
);

// ---------------------------
// Delete User
// ---------------------------
const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-deletion",
    triggers: [
      {
        event: "clerk/user.deleted",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }
);

// ---------------------------
// Update User
// ---------------------------
const syncUserUpdation = inngest.createFunction(
  {
    id: "sync-user-updation",
    triggers: [
      {
        event: "clerk/user.updated",
      },
    ],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim(),
        image: data?.image_url,
      },
    });
  }
);

//to save workspace data to a database

const syncWorkspaceCreation=inngest.createFunction(
    {
        id : 'sync-workspace-from-clerk',

    triggers:[
        {
            event: 'clerk/organization.created',
        },
    ],
},
    async ({event})=>{
        const {data}=event
        await prisma.workspace.create({
            data:{
                id: data.id,
                name: data.name,
                slug:data.slug,
                ownerId:data.created_by,
                image_url:data.image_url,
            }
        })

        //add creator as admin member

        await prisma.workspace.create({
            data:{
                userId:data.created_by,
                workspaceId:data.id,
                role:"ADMIN"
            }
        })
    }

)

//inngest function to update workspace data in database
const syncWorkspaceUpdation=inngest.createFunction(
    {
        id:'update-workspace-from-clerk',

        triggers:[
            {
            event:'clerk/organization.updated',
            },
        ],

},
   async ({event})=>{
    const {data}=event;
    await prisma.workspace.update({
        where:{
            id:data.id,
        },
        data:{
            name: data.name,
                slug:data.slug,
                
                image_url:data.image_url,
               
        }
   })
   }
)


//inngest function to delete workspace from database
const syncWorkspaceDeletion=inngest.createFunction(
    {
        id:'delete-workspace-from-clerk',
    
    triggers:[
        {
        event:'clerk/organization.deleted',
    },
],
    },
async ({event})=>{
    const {data}=event;

    await prisma.workspace.delete({
        where:{
            id:data.id,
        },
    })
}
)

//inngest function to save workspace memn=ber data to db

const syncWorkspaceMemberCreation=inngest.createFunction(
    {
        id:'sync-workspace-member-from-clerk',

        triggers:[
            {
                event:'clerk/organizationMembership.creation',
            },
        ],
    },

    async ({event})=>{
        const {data}=event;

     await prisma.WorkspaceMember.create({
                data:{
                   userId:data.id,
                   workspaceId:data.organization_id,
                   role:String(data.role_name).toUpperCase(),


                },
            })
        }
    
)


// Export all Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
];