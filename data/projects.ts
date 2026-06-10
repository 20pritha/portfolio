export type Project = {
  title: string;
  stack: string[];
  description: string;
  metric: string;
  detailsUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  metrics?: Array<{ value: number; suffix?: string; label: string }>;
};

const projects: Project[] = [
  {
    title: 'Investor Prospect Engine',
    stack: ['FastAPI', 'Gemini', 'RAG', 'Asyncio'],
    description: 'GenAI-enabled LP screening system for a $30M AUM oil & gas PE firm, pulling signals from DealCloud, Preqin, PitchBook, Excel, and Fintrx.',
    metric: 'Reduced prospect review time from hours to seconds for the live fundraising team.',
    metrics: [{ value: 3065, suffix: '', label: 'institutional prospects' }],
  },
  {
    title: 'Zero-Touch Eval Pipeline',
    stack: ['Azure Functions', 'Gemini', 'Claude', 'FastMCP'],
    description: 'Agentic pipeline that evaluates Claude\'s document chat capabilities using Gemini-as-judge inside Azure Functions to prevent bias, with custom metrics for factual correctness and quality dimensions.',
    metric: 'Replaced a 6-step CLI process with a single chat-triggered end-to-end evaluation run.',
    detailsUrl: 'https://github.com/20pritha/evalharness',
    githubUrl: 'https://github.com/20pritha/evalharness',
  },
  {
    title: 'Hospital Waste Segregation',
    stack: ['OpenCV', 'Raspberry Pi', 'CNN', 'Robotics'],
    description: 'End-to-end computer vision system for hazardous waste sorting, controlling a 6-DOF robotic arm via GPIO. 6th semester project — 2nd place in department.',
    metric: 'Achieved ~92% classification accuracy and 95% sorting precision.',
    videoUrl: 'https://youtube.com/shorts/Hny3iAIbsLk?si=xUSu0xFnxEtk37zS',
    metrics: [
      { value: 92, suffix: '%', label: 'classification accuracy' },
      { value: 95, suffix: '%', label: 'sorting precision' },
    ],
  },
  {
    title: 'Insider Threat Detection',
    stack: ['Python', 'Scikit-learn', 'Pandas', 'CERT Dataset'],
    description: 'NUS internship project — ensemble anomaly detection (Isolation Forest + One-Class SVM) across 100,000+ enterprise logs spanning email, HTTP, logon, file, and device events.',
    metric: '18% precision improvement over baselines across 6 behavioral dimensions.',
    detailsUrl: 'https://github.com/20pritha/InsiderSecurityThreatDetection',
    githubUrl: 'https://github.com/20pritha/InsiderSecurityThreatDetection',
  },
  {
    title: 'ReFaceIt',
    stack: ['PyTorch', 'Pix2Pix GAN', 'OpenCV', 'CUHK'],
    description: 'NUS internship project — sketch-to-image translation GAN producing photorealistic face images from hand-drawn sketches, trained on the CUHK Face Dataset.',
    metric: 'Delivered SSIM > 0.88 with adaptive dropout and LR decay for training stabilization.',
    detailsUrl: 'https://github.com/20pritha/ReFaceIt',
    githubUrl: 'https://github.com/20pritha/ReFaceIt',
  },
];

export default projects;
