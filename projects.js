/**
 * PROJECTS DATA
 * 
 * Easy-to-update project list for the portfolio.
 * To add a new project, simply add an object to the PROJECTS array below.
 * 
 * Required fields:
 * - id: Unique identifier (number)
 * - title: Project name
 * - description: Short project description
 * - image: URL or path to project thumbnail
 * - tags: Array of technologies used
 * - liveUrl: URL to the live project
 * 
 * Optional fields:
 * - featured: Boolean to highlight certain projects
 */

const PROJECTS = [
    {
        id: 1,
        title: "TimroData - Web Privacy Exposure Demo",
        description: "See exactly what data websites collect about you automatically - no permissions needed.",
        image: "https://cdn.discordapp.com/attachments/1484075591631110155/1486078154895265984/image.png?ex=69c431a2&is=69c2e022&hm=9737ed4524f3672c8f659dbfb69d9e5622ca3f8e6ee0178935726669483033e3&",
        tags: ["HTML", "CSS", "JavaScript", "Python"],
        liveUrl: "https://livepro.site/TimroData/1/",
        featured: true
    }, /*
    {
        id: 2,
        title: "Real-Time Chat Application",
        description: "A modern chat application featuring real-time messaging, user authentication, and online status indicators using WebSocket technology.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
        tags: ["Vue.js", "Firebase", "WebSocket", "Tailwind CSS"],
        liveUrl: "https://example.com/chat-app",
        featured: true
    },
    {
        id: 3,
        title: "Task Management Dashboard",
        description: "An intuitive task management tool with drag-and-drop functionality, real-time collaboration, and team management features.",
        image: "https://images.unsplash.com/photo-1460925895917-aaf4b91c7e4b?w=400&h=250&fit=crop",
        tags: ["React", "Redux", "Firebase", "Material-UI"],
        liveUrl: "https://example.com/task-dashboard",
        featured: true
    },
    {
        id: 4,
        title: "Weather Forecast App",
        description: "A sleek weather application displaying real-time weather data, forecasts, and weather alerts for multiple locations worldwide.",
        image: "https://images.unsplash.com/photo-1534274988757-a28bf1e0ae38?w=400&h=250&fit=crop",
        tags: ["HTML", "CSS", "JavaScript", "OpenWeather API"],
        liveUrl: "https://example.com/weather-app"
    },
    {
        id: 5,
        title: "Personal Blog Platform",
        description: "A blogging platform with markdown support, category filtering, search functionality, and social media sharing capabilities.",
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop",
        tags: ["Next.js", "Markdown", "Prisma", "PostgreSQL"],
        liveUrl: "https://example.com/blog"
    },
    {
        id: 6,
        title: "Analytics Dashboard",
        description: "A comprehensive analytics dashboard with interactive charts, data visualization, and real-time metrics tracking for business insights.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        tags: ["React", "D3.js", "Chart.js", "Node.js"],
        liveUrl: "https://example.com/analytics"
    },
    {
        id: 7,
        title: "Video Streaming Platform",
        description: "A video streaming solution with adaptive bitrate streaming, user authentication, watchlist management, and recommendation engine.",
        image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=250&fit=crop",
        tags: ["React", "HLS.js", "AWS", "Node.js"],
        liveUrl: "https://example.com/video-stream"
    },
    {
        id: 8,
        title: "Portfolio Website",
        description: "A beautiful, responsive portfolio website showcasing creative work with smooth animations, dark mode support, and optimized performance.",
        image: "https://images.unsplash.com/photo-1467694083663-81efadfb4213?w=400&h=250&fit=crop",
        tags: ["HTML", "CSS", "JavaScript", "GSAP"],
        liveUrl: "https://example.com/portfolio"
    },
    {
        id: 9,
        title: "Fitness Tracker App",
        description: "A mobile-friendly fitness tracking application with workout logging, progress tracking, goal setting, and nutrition management features.",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop",
        tags: ["React Native", "Firebase", "Express.js", "MongoDB"],
        liveUrl: "https://example.com/fitness-tracker"
    }
    */
];

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PROJECTS;
}
