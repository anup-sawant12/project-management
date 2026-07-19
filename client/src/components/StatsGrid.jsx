import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

export default function StatsGrid() {
    const { user } = useUser();
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in ${currentWorkspace?.name || "Workspace"}`,
            bgColor: "bg-blue-500/10 dark:bg-blue-500/5",
            textColor: "text-blue-500 dark:text-blue-400",
            borderColor: "hover:border-blue-500/30 dark:hover:border-blue-400/30",
            shadowColor: "hover:shadow-blue-500/5",
            gradient: "from-blue-500/5 to-transparent",
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
            bgColor: "bg-emerald-500/10 dark:bg-emerald-500/5",
            textColor: "text-emerald-500 dark:text-emerald-400",
            borderColor: "hover:border-emerald-500/30 dark:hover:border-emerald-400/30",
            shadowColor: "hover:shadow-emerald-500/5",
            gradient: "from-emerald-500/5 to-transparent",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            bgColor: "bg-purple-500/10 dark:bg-purple-500/5",
            textColor: "text-purple-500 dark:text-purple-400",
            borderColor: "hover:border-purple-500/30 dark:hover:border-purple-400/30",
            shadowColor: "hover:shadow-purple-500/5",
            gradient: "from-purple-500/5 to-transparent",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            bgColor: "bg-rose-500/10 dark:bg-rose-500/5",
            textColor: "text-rose-500 dark:text-rose-400",
            borderColor: "hover:border-rose-500/30 dark:hover:border-rose-400/30",
            shadowColor: "hover:shadow-rose-500/5",
            gradient: "from-rose-500/5 to-transparent",
        },
    ];

    useEffect(() => {
        if (currentWorkspace && user) {
            setStats({
                totalProjects: currentWorkspace.projects.length,
                activeProjects: currentWorkspace.projects.filter(
                    (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
                ).length,
                completedProjects: currentWorkspace.projects
                    .filter((p) => p.status === "COMPLETED")
                    .reduce((acc, project) => acc + project.tasks.length, 0),
                myTasks: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc +
                        project.tasks.filter(
                            (t) => t.assigneeId === user.id
                        ).length,
                    0
                ),
                overdueIssues: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc + project.tasks.filter((t) => t.due_date < new Date()).length,
                    0
                ),
            });
        }
    }, [currentWorkspace, user]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle, bgColor, textColor, borderColor, shadowColor, gradient }, i) => (
                    <div key={i} className={`relative overflow-hidden bg-white dark:bg-zinc-950/80 dark:bg-gradient-to-b ${gradient} border border-zinc-200 dark:border-zinc-800/80 ${borderColor} ${shadowColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-2xl`} >
                        {/* Interactive glow effect */}
                        <div className="p-6 py-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        {title}
                                    </p>
                                    <p className="text-3xl font-extrabold text-zinc-800 dark:text-white tracking-tight">
                                        {value}
                                    </p>
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-2xl ${bgColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                                    <Icon size={22} className={textColor} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
