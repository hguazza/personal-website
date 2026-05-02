import { Project } from '@/types'

export const projects: Project[] = [
  {
    title: 'Fraud Detection Agent System',
    description:
      'Async multi-agent system that analyzed 5,000+ calls in 100 minutes, tracking operator behaviors and false deal claims. Detected R$5M+ in fraud and eliminated the need for manual analysis.',
    stack: ['Elasticsearch', 'Python', 'AsyncIO', 'Semaphore', 'FastAPI'],
    highlight: 'R$5M+ fraud detected',
  },
  {
    title: 'Voice Platform — Debt Collection',
    description:
      'End-to-end voice AI platform for call center debt collection. Covers audio preprocessing, Whisper fine-tuning, transcription post-processing, and a human evaluation loop for continuous improvement.',
    stack: ['Whisper', 'FastAPI', 'Apache Airflow', 'MongoDB', 'Docker'],
  },
  {
    title: 'Monitoring & Quality Agent',
    description:
      'AI agent that replaces human quality evaluation of calls with 90%+ accuracy. Includes a human feedback platform, dataset preparation pipeline, and fine-tuning loop.',
    stack: ['LangGraph', 'LangFuse', 'FastAPI', 'MongoDB', 'LangChain'],
    highlight: '90%+ accuracy',
  },
  {
    title: 'AI Voice Agent — Operator Training',
    description:
      'Simulates real client calls, scores operator performance in real time, and delivers structured feedback to accelerate training of new call center agents.',
    stack: ['LiveKit', 'Deepgram', 'ElevenLabs', 'LangChain', 'FastAPI'],
  },
  {
    title: 'ML Pipeline Optimization',
    description:
      'Migrated and optimized the full data pipeline from NiFi to Airflow, including audio preprocessing, Whisper fine-tuning stages, and transcription post-processing.',
    stack: ['Apache Airflow', 'NiFi', 'Whisper', 'Python', 'Docker'],
  },
  {
    title: 'AI Governance Framework',
    description:
      'Developed company-wide AI governance policy including PEAS framework mapping, model inventory tracking, and a defensive layered security model for AI systems.',
    stack: ['PEAS Framework', 'Policy Design', 'Risk Assessment'],
  },
]
