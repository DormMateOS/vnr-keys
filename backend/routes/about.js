import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    project: {
      title: "VNR-Keys",
      description:
        "A smart key management system designed to streamline key allocation, tracking, and return processes for improved security and efficiency.",
    },
    team: [
      {
        name: "Karthik",
        role: "Project Lead Developer",
        avatar: "/karthik.png",
        socials: {
          github: "https://github.com/gurramkarthiknetha",
          linkedin: "https://www.linkedin.com/in/gurramkarthiknetha/",
        },
      },
      {
        name: "Vishnu",
        role: "Frontend Developer",
        avatar: "/vishnu.jpg",
        socials: {
          github: "#",
          linkedin: "#",
        },
      },
      {
        name: "Bhavishwa",
        role: "Backend Developer",
        avatar: "/bhavishwa.jpg",
        socials: {
          github: "https://github.com/BhavishwaReddy2023",
          linkedin:
            "https://www.linkedin.com/in/bhavishwa-reddy-puli-6946482b8/",
        },
      },
      {
        name: "Shiva",
        role: "Frontend Developer",
        avatar: "/shivareddy.jpg",
        socials: {
          github: "https://github.com/codebyshivareddiee",
          linkedin:
            "https://www.linkedin.com/in/shivareddykottamittapally/",
        },
      },
      {
        name: "Srikar",
        role: "UI/UX & Frontend Developer",
        avatar: "/srikarreddy.jpg",
        socials: {
          github: "https://github.com",
          linkedin: "https://linkedin.com",
        },
      },
      {
        name: "Rishith",
        role: "Full Stack Developer",
        avatar: "/rishith.jpg",
        socials: {
          github: "#",
          linkedin: "#",
        },
      },
      {
        name: "Javeed",
        role: "Frontend Developer",
        avatar: "/javeed.png",
        socials: {
          github: "https://github.com/javeedshaik13",
          linkedin: "https://www.linkedin.com/in/javeed-shaik-8824282a2/",
        },
      },
    ],
  });
});

export default router;
