-- Seed data, generated from Harsha BM's resume.
-- Everything here is fully editable later from /admin — this just gives
-- the page real content on first run instead of "Lorem ipsum".
-- Run with: psql -U postgres -d portfolio_wiki -f seed.sql

-- 1. Profile / infobox -------------------------------------------------
INSERT INTO profile (name, photo_url, dob, education, location, occupation, interests, intro)
VALUES (
  'Harsha BM',
  '',
  'Add via admin panel',
  'B.E. Computer Science, HKBK College of Engineering (VTU)',
  'Bangalore, India',
  'Computer Science Undergraduate · AI Engineer',
  ARRAY['Artificial Intelligence', 'Machine Learning', 'Generative AI', 'Agentic Systems', 'Reinforcement Learning'],
  'Harsha BM is a computer science undergraduate and AI engineer based in Bangalore, India, specializing in artificial intelligence, machine learning, generative AI and agentic systems. He has built several production-ready AI applications, including autonomous AI agents, retrieval-augmented generation (RAG) systems, and multimodal AI solutions. He is the founder of OpenDev AI, an open-source autonomous agent project, and of CodeCircle, a student AI/ML learning community.'
);

-- 2. Free-text sections --------------------------------------------------
INSERT INTO sections (slug, title, order_index, content) VALUES
('early_life', 'Early life', 1,
 'Harsha grew up in Bangalore, India, where he developed an early interest in computers and problem solving. This section is a placeholder — add details about upbringing, schooling and early influences from the admin panel.'),
('research_interests', 'Research interests', 7,
 'Harsha''s interests center on generative AI and agentic systems, including retrieval-augmented generation (RAG), autonomous AI agents and LLM orchestration, reinforcement learning (Q-learning and policy optimization), and multimodal AI systems that combine vision and language models.'),
('contact', 'Contact', 10,
 'Email: harshabm16@gmail.com
Phone: +91 7795187970
Location: Bangalore, India
LinkedIn: add link via admin
GitHub: add link via admin');

-- 3. Education ------------------------------------------------------------
INSERT INTO list_items (section_slug, title, subtitle, description, link, date_start, date_end, order_index) VALUES
('education', 'HKBK College of Engineering (VTU)', 'B.E. in Computer Science and Engineering', '', '', '2023', '2027', 1),
('education', 'Seshadripuram Composite PU College', 'Class XII — Science Stream', 'Scored 90%', '', '2022', '2022', 2);

-- 4. Technical skills -------------------------------------------------------
INSERT INTO list_items (section_slug, title, subtitle, description, order_index) VALUES
('technical_skills', 'Languages', '', 'Python, Java, C++, C, JavaScript', 1),
('technical_skills', 'AI/ML Frameworks', '', 'scikit-learn, Hugging Face Transformers, LangChain, LangGraph, FastAPI', 2),
('technical_skills', 'Machine Learning', '', 'Supervised Learning, Classification, Regression, Feature Engineering, TF-IDF, Logistic Regression, Decision Trees, Random Forest, Reinforcement Learning, Q-Learning, Policy Optimization', 3),
('technical_skills', 'GenAI / LLMs', '', 'Prompt Engineering, RAG, AI Agents, LLM Orchestration, Gemini API, Groq API, LLaMA 3.1, OpenRouter', 4),
('technical_skills', 'Databases', '', 'ChromaDB, MySQL, MongoDB, PostgreSQL, pandas, NumPy', 5),
('technical_skills', 'Dev Tools', '', 'Git, GitHub Actions, Docker, Jupyter Notebook, VS Code, Vercel, Render, AWS, GCP', 6),
('technical_skills', 'Web & APIs', '', 'React.js, Node.js, Flutter, REST APIs, WebSockets, CI/CD Pipelines', 7);

-- 5. Experience / leadership -------------------------------------------------
INSERT INTO list_items (section_slug, title, subtitle, description, date_start, date_end, order_index) VALUES
('experience', 'Founder & Maintainer', 'OpenDev AI', 'Open-source autonomous AI agent project.', '2026', 'Present', 1),
('experience', 'Founder & Maintainer', 'CodeCircle Tech Community', 'Student AI/ML learning community.', '2025', 'Present', 2),
('experience', 'Member', 'Indian Society for Technical Education (ISTE)', '', '', '', 3);

-- 6. Projects -----------------------------------------------------------
INSERT INTO list_items (section_slug, title, subtitle, description, link, order_index) VALUES
('projects', 'OpenDev AI — Autonomous AI Agent', 'Python · Q-Learning RL · Gemini · Groq · FastAPI · GitHub API',
 'Architected an LLM-powered autonomous agent combining reinforcement learning with Gemini and Groq APIs for intelligent decision-making with minimal human intervention.', '', 1),
('projects', 'GoHeavy — AI Fitness & Nutrition Platform', 'Flutter · Firebase · Gemini API · FastAPI · OpenRouter',
 'A full-stack AI-powered fitness application tracking calories, nutrition, water intake, workouts and health goals, with a polished dark/light themed UI.', '', 2),
('projects', 'Gemma Lens — Multimodal AI Application', 'Python · Gemini · Computer Vision · AI APIs',
 'A visual understanding system that analyzes images and generates contextual responses using multimodal LLMs.', '', 3),
('projects', 'AI Vyasa — Spoiler-Free Lore Encyclopedia', 'Python · RAG · LangChain · Vector Databases · LLM APIs',
 'A spoiler-aware RAG encyclopedia for Netflix''s Kurukshetra: The Great War of Mahabharata, combining semantic retrieval and character relationship graphs to help users explore lore, events and connections without revealing future plot points.', '', 4);

-- 7. Achievements ---------------------------------------------------------
INSERT INTO list_items (section_slug, title, subtitle, description, date_start, order_index) VALUES
('achievements', '2nd Runner Up', 'AI Ignite Hackathon', '', '', 1),
('achievements', '2nd Runner Up', 'Shannon Codec Hackathon', '', '', 2),
('achievements', 'Attended AI Developer Conference', '2025', '', '2025', 3),
('achievements', 'Attended Google Gemini CLI Workshop & Agentic AI Day', '', '', '', 4),
('achievements', 'Attended Bangalore Tech Summit', '2024', '', '2024', 5),
('achievements', 'Attended Open Source India', '2024 & 2025', '', '', 6);

-- 8. Certifications ---------------------------------------------------------
INSERT INTO list_items (section_slug, title, subtitle, description, date_start, order_index) VALUES
('certifications', 'Introduction to Linux (LFS101)', 'The Linux Foundation', '', '2025', 1),
('certifications', 'Intro to Machine Learning', 'Kaggle', '', '2026', 2);

-- 9. Timeline ---------------------------------------------------------------
INSERT INTO timeline_events (event_date, title, description, order_index) VALUES
('2022', 'Completed Class XII', 'Science stream, Seshadripuram Composite PU College — scored 90%.', 1),
('2023', 'Began B.E. in Computer Science', 'Enrolled at HKBK College of Engineering, VTU Bangalore.', 2),
('2024', 'Tech community involvement', 'Attended Bangalore Tech Summit and Open Source India.', 3),
('2025', 'Founded CodeCircle Tech Community', 'Also completed the LFS101 Linux Foundation certification and attended the AI Developer Conference and Gemini CLI Workshop & Agentic AI Day.', 4),
('2026', 'Founded OpenDev AI', 'Launched the open-source autonomous AI agent project; completed Kaggle''s Intro to Machine Learning certification.', 5);

-- 10. References ----------------------------------------------------------
INSERT INTO "references" (label, type, url, order_index) VALUES
('Harsha BM — Resume (PDF)', 'resume', '/uploads/resume_final.pdf', 1),
('LinkedIn Profile', 'link', '#', 2),
('GitHub Profile', 'link', '#', 3);
