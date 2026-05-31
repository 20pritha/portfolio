export type Project = {
  title: string;
  stack: string[];
  description: string;
  metric: string;
  detailsUrl: string;
  githubUrl?: string;
  metrics?: Array<{ value: number; suffix?: string; label: string }>;
};

const projects: Project[] = [
  {
    title: 'Investor Prospect Engine',
    stack: ['FastAPI', 'Gemini', 'RAG', 'Asyncio'],
    description: 'GenAI-enabled LP screening system that pulls institutional prospect signals from DealCloud, Preqin, PitchBook, and Excel.',
    metric: 'Reduced prospect review time from hours to seconds for the live IR team.',
    detailsUrl: 'https://github.com/prixie',
    // githubUrl: 'https://github.com/prixie/<repo-name>',
    metrics: [{ value: 3000, suffix: '', label: 'institutional prospects' }],
  },
  {
    title: 'Zero-Touch Eval Pipeline',
    stack: ['FastMCP', 'Agentic LLMs', 'Cosmos DB', 'Python'],
    description: 'Automated agentic evaluation workflow with ground-truth fetching, production RAG scoring, and repeatable LLM judge runs.',
    metric: 'Enabled consistent evaluation across production prompts without manual intervention.',
    detailsUrl: 'https://github.com/20pritha/evalharness',
    githubUrl: 'https://github.com/20pritha/evalharness',
  },
  {
    title: 'Hospital Waste Segregation',
    stack: ['OpenCV', 'Raspberry Pi', 'CNN', 'Robotics'],
    description: 'End-to-end computer vision system for hazardous waste sorting, controlling a 6-DOF robotic arm via GPIO.',
    metric: 'Achieved ~92% classification accuracy and 95% sorting precision.',
    detailsUrl: 'https://github.com/prixie',
    // githubUrl: 'https://github.com/prixie/<repo-name>',
    metrics: [
      { value: 92, suffix: '%', label: 'classification accuracy' },
      { value: 95, suffix: '%', label: 'sorting precision' },
    ],
  },
  {
    title: 'Insider Threat Detection',
    stack: ['Python', 'Scikit-learn', 'Pandas', 'CERT Dataset'],
    description: 'Behavioral anomaly detection system across 5 CERT dataset log types — email, HTTP, logon, file, and device — using custom rules to flag deviations from baseline user patterns.',
    metric: '18% precision improvement over ensemble detection baselines across 5 CERT log types.',
    detailsUrl: 'https://github.com/20pritha/InsiderSecurityThreatDetection',
    githubUrl: 'https://github.com/20pritha/InsiderSecurityThreatDetection',
  },
  {
    title: 'ReFaceIt',
    stack: ['PyTorch', 'Pix2Pix GAN', 'OpenCV', 'CUHK'],
    description: 'Sketch-to-image translation project producing photorealistic face images from hand-drawn input sketches.',
    metric: 'Delivered SSIM > 0.88 with adaptive training stabilization.',
    detailsUrl: 'https://github.com/20pritha/ReFaceIt',
    githubUrl: 'https://github.com/20pritha/ReFaceIt',
  },
];

export default projects;
