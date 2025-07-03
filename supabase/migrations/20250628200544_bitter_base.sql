/*
  # Add Southern Africa Job Listings

  1. New Data
    - Insert demo jobs focused on Eswatini, Lesotho, and Botswana
    - Jobs include various industries relevant to these countries
    - Salary ranges appropriate for the region

  2. Job Categories
    - Government and public sector roles
    - Mining and natural resources
    - Tourism and hospitality
    - Agriculture and development
    - Technology and telecommunications
*/

-- Insert demo jobs for Southern Africa region
INSERT INTO jobs (title, company, location, salary, description, requirements) VALUES
(
  'Senior Software Developer',
  'MTN Eswatini',
  'Mbabane, Eswatini',
  'E15,000 - E25,000 per month',
  'Join MTN Eswatini as a Senior Software Developer to lead digital transformation initiatives. You will be responsible for developing mobile applications, web platforms, and backend systems that serve millions of customers across the kingdom. Work with cutting-edge technologies including cloud computing, microservices, and mobile development frameworks.

Key Responsibilities:
• Design and develop scalable software solutions
• Lead technical architecture decisions
• Mentor junior developers
• Collaborate with cross-functional teams
• Ensure code quality and best practices',
  'Bachelor''s degree in Computer Science, 5+ years software development experience, Proficiency in Java/Python/JavaScript, Experience with cloud platforms (AWS/Azure), Knowledge of mobile development, Strong problem-solving skills'
),
(
  'Mining Engineer',
  'Debswana Diamond Company',
  'Gaborone, Botswana',
  'P45,000 - P65,000 per month',
  'Debswana Diamond Company seeks an experienced Mining Engineer to join our operations team. You will be responsible for planning, designing, and overseeing diamond mining operations while ensuring safety, efficiency, and environmental compliance. This role offers the opportunity to work with world-class diamond deposits and cutting-edge mining technology.

Key Responsibilities:
• Plan and design mining operations
• Ensure compliance with safety regulations
• Optimize extraction processes
• Manage mining equipment and resources
• Collaborate with geological teams',
  'Bachelor''s degree in Mining Engineering, 3+ years mining experience, Knowledge of diamond mining processes, Familiarity with mining software, Strong analytical skills, Valid mining certification'
),
(
  'Tourism Development Manager',
  'Lesotho Tourism Development Corporation',
  'Maseru, Lesotho',
  'M18,000 - M28,000 per month',
  'Lead tourism development initiatives across the Mountain Kingdom of Lesotho. This role involves developing sustainable tourism strategies, managing community-based tourism projects, and promoting Lesotho as a premier adventure and cultural destination. Work closely with local communities, international partners, and government stakeholders.

Key Responsibilities:
• Develop tourism marketing strategies
• Manage community tourism projects
• Coordinate with international tour operators
• Organize cultural and adventure tourism events
• Monitor tourism industry trends',
  'Bachelor''s degree in Tourism/Business, 4+ years tourism industry experience, Knowledge of sustainable tourism practices, Strong communication skills, Experience with community development, Fluency in English and Sesotho preferred'
),
(
  'Agricultural Extension Officer',
  'Ministry of Agriculture - Eswatini',
  'Manzini, Eswatini',
  'E8,000 - E12,000 per month',
  'Support smallholder farmers across Eswatini in adopting modern agricultural practices and improving crop yields. This government position involves providing technical assistance, training farmers on sustainable farming methods, and implementing agricultural development programs that enhance food security and rural livelihoods.

Key Responsibilities:
• Provide technical support to farmers
• Conduct training workshops
• Implement agricultural development programs
• Monitor crop production and yields
• Collaborate with rural communities',
  'Diploma/Degree in Agriculture, 2+ years extension experience, Knowledge of crop production systems, Strong interpersonal skills, Ability to work in rural areas, Fluency in siSwati and English'
),
(
  'Financial Analyst',
  'Bank of Botswana',
  'Gaborone, Botswana',
  'P35,000 - P50,000 per month',
  'Join the Bank of Botswana as a Financial Analyst to support monetary policy decisions and economic research. You will analyze financial markets, prepare economic reports, and contribute to policy recommendations that shape Botswana''s economic future. This role offers exposure to central banking operations and macroeconomic analysis.

Key Responsibilities:
• Conduct financial market analysis
• Prepare economic research reports
• Support monetary policy decisions
• Monitor banking sector performance
• Analyze macroeconomic indicators',
  'Bachelor''s degree in Economics/Finance, 3+ years financial analysis experience, Strong analytical and quantitative skills, Knowledge of financial markets, Proficiency in statistical software, CFA certification preferred'
),
(
  'Renewable Energy Project Manager',
  'Lesotho Electricity Company',
  'Maseru, Lesotho',
  'M25,000 - M35,000 per month',
  'Lead renewable energy projects across Lesotho, focusing on hydroelectric and solar power development. This role involves managing large-scale infrastructure projects, coordinating with international development partners, and contributing to Lesotho''s energy independence goals. Work on projects that will power the nation''s future growth.

Key Responsibilities:
• Manage renewable energy projects
• Coordinate with international partners
• Oversee project budgets and timelines
• Ensure regulatory compliance
• Supervise engineering teams',
  'Bachelor''s degree in Engineering, 5+ years project management experience, Knowledge of renewable energy systems, PMP certification preferred, Experience with international development projects, Strong leadership skills'
),
(
  'Digital Marketing Specialist',
  'Eswatini Communications Commission',
  'Mbabane, Eswatini',
  'E10,000 - E16,000 per month',
  'Drive digital transformation initiatives and promote ICT adoption across Eswatini. This role involves developing digital marketing campaigns, managing social media presence, and creating content that educates citizens about digital services and opportunities. Help bridge the digital divide and promote e-governance initiatives.

Key Responsibilities:
• Develop digital marketing strategies
• Manage social media campaigns
• Create educational content
• Promote e-governance services
• Analyze digital engagement metrics',
  'Bachelor''s degree in Marketing/Communications, 2+ years digital marketing experience, Social media management skills, Content creation abilities, Knowledge of digital analytics tools, Creative thinking and innovation'
),
(
  'Wildlife Conservation Officer',
  'Department of Wildlife and National Parks - Botswana',
  'Maun, Botswana',
  'P28,000 - P40,000 per month',
  'Protect Botswana''s world-renowned wildlife and natural heritage through conservation programs and anti-poaching initiatives. Based in Maun, gateway to the Okavango Delta, you will work on wildlife monitoring, community conservation programs, and sustainable tourism development that benefits both wildlife and local communities.

Key Responsibilities:
• Implement wildlife conservation programs
• Conduct anti-poaching operations
• Monitor wildlife populations
• Engage with local communities
• Support eco-tourism initiatives',
  'Bachelor''s degree in Wildlife Management/Biology, 3+ years conservation experience, Knowledge of African wildlife, Physical fitness for field work, Firearms proficiency, Passion for conservation'
);