const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Worker = require('./models/Worker');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const SkillAssessment = require('./models/SkillAssessment');

dotenv.config();

const categories = ['electrician', 'plumber', 'carpenter', 'acTechnician', 'painter', 'beautician', 'applianceRepair', 'cleaning', 'mechanic', 'tutor', 'graphicDesigner', 'webDeveloper', 'photographer'];
const cities = [
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 }
];

const services = [
  { name: 'Electrical Repair & Installation', category: 'electrician', description: 'Professional electrical repair, wiring, and installation services', icon: 'zap', basePrice: 499, estimatedDuration: '1-3 hours', subcategories: [{ name: 'Wiring Repair', price: 599 }, { name: 'Fan Installation', price: 399 }, { name: 'MCB/RCCB Installation', price: 699 }, { name: 'Full House Rewiring', price: 4999 }] },
  { name: 'Plumbing Services', category: 'plumber', description: 'Expert plumbing repair, installation, and maintenance', icon: 'droplet', basePrice: 449, estimatedDuration: '1-4 hours', subcategories: [{ name: 'Pipe Repair', price: 499 }, { name: 'Tap Installation', price: 349 }, { name: 'Toilet Repair', price: 599 }, { name: 'Water Tank Cleaning', price: 799 }] },
  { name: 'Carpentry & Woodwork', category: 'carpenter', description: 'Custom furniture, repair, and woodwork services', icon: 'hammer', basePrice: 599, estimatedDuration: '2-8 hours', subcategories: [{ name: 'Furniture Repair', price: 499 }, { name: 'Door Installation', price: 899 }, { name: 'Wardrobe Assembly', price: 1499 }, { name: 'Custom Shelving', price: 999 }] },
  { name: 'AC Repair & Service', category: 'acTechnician', description: 'AC installation, repair, gas refill, and maintenance', icon: 'wind', basePrice: 599, estimatedDuration: '1-3 hours', subcategories: [{ name: 'AC Servicing', price: 599 }, { name: 'Gas Refill', price: 1499 }, { name: 'AC Installation', price: 1999 }, { name: 'Compressor Repair', price: 3499 }] },
  { name: 'Painting Services', category: 'painter', description: 'Interior and exterior painting with premium finishes', icon: 'palette', basePrice: 1299, estimatedDuration: '4-24 hours', subcategories: [{ name: 'Room Painting', price: 2999 }, { name: 'Wall Primer', price: 999 }, { name: 'Exterior Painting', price: 4999 }, { name: 'Texture Painting', price: 3999 }] },
  { name: 'Beauty & Wellness', category: 'beautician', description: 'Professional beauty services at your doorstep', icon: 'sparkles', basePrice: 399, estimatedDuration: '1-4 hours', subcategories: [{ name: 'Facial', price: 599 }, { name: 'Threading', price: 149 }, { name: 'Hair Color', price: 999 }, { name: 'Full Body Wax', price: 1499 }] },
  { name: 'Appliance Repair', category: 'applianceRepair', description: 'Expert repair for all home appliances', icon: 'settings', basePrice: 449, estimatedDuration: '1-3 hours', subcategories: [{ name: 'Washing Machine', price: 599 }, { name: 'Refrigerator', price: 699 }, { name: 'Microwave', price: 499 }, { name: 'Water Heater', price: 599 }] },
  { name: 'Home Cleaning', category: 'cleaning', description: 'Deep cleaning, regular cleaning, and sanitization', icon: 'sparkle', basePrice: 799, estimatedDuration: '3-6 hours', subcategories: [{ name: 'Deep Cleaning', price: 1499 }, { name: 'Kitchen Cleaning', price: 899 }, { name: 'Bathroom Cleaning', price: 599 }, { name: 'Sofa Cleaning', price: 999 }] },
  { name: 'Vehicle Mechanic', category: 'mechanic', description: 'Two-wheeler and four-wheeler repair and maintenance', icon: 'car', basePrice: 399, estimatedDuration: '1-4 hours', subcategories: [{ name: 'Oil Change', price: 299 }, { name: 'Brake Service', price: 499 }, { name: 'Engine Tune-up', price: 799 }, { name: 'Battery Replacement', price: 1499 }] },
  { name: 'Home Tutoring', category: 'tutor', description: 'Expert tutors for all subjects and competitive exams', icon: 'book', basePrice: 499, estimatedDuration: '1-2 hours', subcategories: [{ name: 'Mathematics', price: 599 }, { name: 'Science', price: 599 }, { name: 'English', price: 499 }, { name: 'JEE/NEET Prep', price: 999 }] },
  { name: 'Graphic Design', category: 'graphicDesigner', description: 'Logo, branding, and graphic design services', icon: 'pen-tool', basePrice: 999, estimatedDuration: '2-5 days', subcategories: [{ name: 'Logo Design', price: 1999 }, { name: 'Business Card', price: 499 }, { name: 'Banner Design', price: 799 }, { name: 'Brand Kit', price: 4999 }] },
  { name: 'Web Development', category: 'webDeveloper', description: 'Custom websites, e-commerce, and web applications', icon: 'code', basePrice: 4999, estimatedDuration: '5-30 days', subcategories: [{ name: 'Landing Page', price: 2999 }, { name: 'Business Website', price: 7999 }, { name: 'E-commerce Store', price: 14999 }, { name: 'Web Application', price: 24999 }] },
  { name: 'Photography', category: 'photographer', description: 'Professional photography for events, portraits, and products', icon: 'camera', basePrice: 1499, estimatedDuration: '2-8 hours', subcategories: [{ name: 'Portrait Session', price: 1499 }, { name: 'Event Photography', price: 3999 }, { name: 'Product Photography', price: 2499 }, { name: 'Pre-wedding', price: 9999 }] }
];

const workerData = [
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com', phone: '9876543210', category: 'electrician', level: 'master', score: 94, exp: 15, city: 0, bio: 'Licensed electrical contractor with 15 years of experience in residential and commercial projects. Specialized in smart home wiring and industrial electrical systems.', pricing: { min: 799, max: 2499 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 856, success: 99, onTime: 98, satisfaction: 96, reviews: 234 }, subcategories: ['Wiring Repair', 'Fan Installation', 'MCB/RCCB Installation', 'Smart Home Wiring'] },
  { name: 'Suresh Babu', email: 'suresh.babu@email.com', phone: '9876543211', category: 'electrician', level: 'expert', score: 82, exp: 10, city: 1, bio: 'Expert electrician specializing in residential rewiring and generator installations.', pricing: { min: 599, max: 1799 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 543, success: 97, onTime: 95, satisfaction: 92, reviews: 167 }, subcategories: ['Wiring Repair', 'Generator Installation', 'Inverter Setup'] },
  { name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '9876543212', category: 'plumber', level: 'master', score: 91, exp: 12, city: 2, bio: 'Award-winning plumber with expertise in modern bathroom renovations and waterproofing solutions.', pricing: { min: 699, max: 2199 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 723, success: 98, onTime: 97, satisfaction: 95, reviews: 198 }, subcategories: ['Pipe Repair', 'Bathroom Renovation', 'Waterproofing', 'Water Tank Cleaning'] },
  { name: 'Arjun Reddy', email: 'arjun.reddy@email.com', phone: '9876543213', category: 'plumber', level: 'skilled', score: 68, exp: 5, city: 3, bio: 'Skilled plumber focused on residential plumbing and drainage solutions.', pricing: { min: 399, max: 1299 }, verified: { identity: true, practicalSkill: true, experience: true, certification: false, background: true }, stats: { jobs: 234, success: 94, onTime: 92, satisfaction: 88, reviews: 89 }, subcategories: ['Pipe Repair', 'Tap Installation', 'Drainage Cleaning'] },
  { name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '9876543214', category: 'carpenter', level: 'master', score: 92, exp: 18, city: 4, bio: 'Master carpenter with traditional and modern woodworking expertise. Specializes in custom furniture and interior woodwork.', pricing: { min: 899, max: 2299 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 678, success: 99, onTime: 96, satisfaction: 97, reviews: 189 }, subcategories: ['Furniture Repair', 'Custom Furniture', 'Door Installation', 'Wardrobe Assembly'] },
  { name: 'Karthik Nair', email: 'karthik.nair@email.com', phone: '9876543215', category: 'carpenter', level: 'expert', score: 79, exp: 8, city: 5, bio: 'Expert carpenter specializing in modular kitchen installations and false ceiling work.', pricing: { min: 599, max: 1699 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: false }, stats: { jobs: 412, success: 96, onTime: 94, satisfaction: 91, reviews: 134 }, subcategories: ['Modular Kitchen', 'False Ceiling', 'Furniture Repair'] },
  { name: 'Mohammed Irfan', email: 'mohammed.irfan@email.com', phone: '9876543216', category: 'acTechnician', level: 'master', score: 96, exp: 14, city: 6, bio: 'Top-rated AC technician. Certified by Daikin and Voltas. Expert in all AC brands and centralized cooling systems.', pricing: { min: 699, max: 1999 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 934, success: 99, onTime: 98, satisfaction: 97, reviews: 278 }, subcategories: ['AC Servicing', 'Gas Refill', 'AC Installation', 'Compressor Repair'] },
  { name: 'Amit Patel', email: 'amit.patel@email.com', phone: '9876543217', category: 'acTechnician', level: 'expert', score: 84, exp: 9, city: 0, bio: 'Expert AC technician with specialization in inverter AC and ducted systems.', pricing: { min: 549, max: 1599 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 567, success: 97, onTime: 96, satisfaction: 93, reviews: 178 }, subcategories: ['AC Servicing', 'Inverter AC Repair', 'Ducted Systems'] },
  { name: 'Deepak Verma', email: 'deepak.verma@email.com', phone: '9876543218', category: 'painter', level: 'expert', score: 81, exp: 11, city: 7, bio: 'Expert painter known for flawless finishes. Specializes in texture painting and waterproof coatings.', pricing: { min: 999, max: 1899 }, verified: { identity: true, practicalSkill: true, experience: true, certification: false, background: true }, stats: { jobs: 456, success: 96, onTime: 93, satisfaction: 90, reviews: 145 }, subcategories: ['Room Painting', 'Texture Painting', 'Exterior Painting', 'Waterproof Coating'] },
  { name: 'Sanjay Joshi', email: 'sanjay.joshi@email.com', phone: '9876543219', category: 'painter', level: 'skilled', score: 62, exp: 4, city: 1, bio: 'Skilled painter with a keen eye for detail and color combinations.', pricing: { min: 499, max: 1199 }, verified: { identity: true, practicalSkill: true, experience: true, certification: false, background: true }, stats: { jobs: 178, success: 93, onTime: 90, satisfaction: 86, reviews: 67 }, subcategories: ['Room Painting', 'Wall Primer', 'Interior Painting'] },
  { name: 'Lakshmi Devi', email: 'lakshmi.devi@email.com', phone: '9876543220', category: 'beautician', level: 'master', score: 93, exp: 16, city: 2, bio: 'Senior beautician and salon owner with expertise in international beauty treatments. Trained in Korean skincare and European hair styling.', pricing: { min: 599, max: 1899 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 1123, success: 98, onTime: 97, satisfaction: 96, reviews: 345 }, subcategories: ['Facial', 'Hair Color', 'Full Body Wax', 'Bridal Makeup'] },
  { name: 'Meena Kumari', email: 'meena.kumari@email.com', phone: '9876543221', category: 'beautician', level: 'skilled', score: 58, exp: 3, city: 3, bio: 'Skilled beautician specializing in threading, facials, and basic hair styling.', pricing: { min: 199, max: 899 }, verified: { identity: true, practicalSkill: true, experience: false, certification: false, background: true }, stats: { jobs: 156, success: 91, onTime: 88, satisfaction: 84, reviews: 56 }, subcategories: ['Threading', 'Facial', 'Hair Styling'] },
  { name: 'Ravi Teja', email: 'ravi.teja@email.com', phone: '9876543222', category: 'applianceRepair', level: 'master', score: 88, exp: 13, city: 4, bio: 'Master appliance repair technician. Authorized service partner for Samsung, LG, and Bosch.', pricing: { min: 499, max: 1799 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 789, success: 98, onTime: 96, satisfaction: 95, reviews: 212 }, subcategories: ['Washing Machine', 'Refrigerator', 'Microwave', 'Water Heater', 'Dishwasher'] },
  { name: 'Ganesh Iyer', email: 'ganesh.iyer@email.com', phone: '9876543223', category: 'applianceRepair', level: 'expert', score: 76, exp: 7, city: 5, bio: 'Expert in all major appliance brands with fast turnaround time.', pricing: { min: 399, max: 1399 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: false }, stats: { jobs: 345, success: 95, onTime: 93, satisfaction: 89, reviews: 112 }, subcategories: ['Washing Machine', 'Refrigerator', 'AC Repair'] },
  { name: 'Ananya Mukherjee', email: 'ananya.m@email.com', phone: '9876543224', category: 'cleaning', level: 'expert', score: 85, exp: 8, city: 6, bio: 'Professional cleaning service lead with eco-friendly cleaning solutions and industrial-grade equipment.', pricing: { min: 799, max: 1599 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 567, success: 97, onTime: 96, satisfaction: 94, reviews: 178 }, subcategories: ['Deep Cleaning', 'Kitchen Cleaning', 'Sofa Cleaning', 'Office Cleaning'] },
  { name: 'Prakash Gupta', email: 'prakash.g@email.com', phone: '9876543225', category: 'cleaning', level: 'basic', score: 42, exp: 1, city: 7, bio: 'Fresh and enthusiastic cleaning professional committed to quality service.', pricing: { min: 299, max: 799 }, verified: { identity: true, practicalSkill: false, experience: false, certification: false, background: true }, stats: { jobs: 45, success: 89, onTime: 85, satisfaction: 80, reviews: 23 }, subcategories: ['Home Cleaning', 'Bathroom Cleaning'] },
  { name: 'Ramesh Choudhary', email: 'ramesh.c@email.com', phone: '9876543226', category: 'mechanic', level: 'expert', score: 83, exp: 10, city: 0, bio: 'Expert two-wheeler and car mechanic. Former service center lead at Hero MotoCorp.', pricing: { min: 399, max: 1499 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 623, success: 97, onTime: 95, satisfaction: 92, reviews: 189 }, subcategories: ['Oil Change', 'Brake Service', 'Engine Tune-up', 'Battery Replacement'] },
  { name: 'Venkatesh Rao', email: 'venkatesh.r@email.com', phone: '9876543227', category: 'mechanic', level: 'basic', score: 38, exp: 1, city: 1, bio: 'Apprentice mechanic learning the ropes with hands-on training.', pricing: { min: 199, max: 599 }, verified: { identity: true, practicalSkill: false, experience: false, certification: false, background: true }, stats: { jobs: 32, success: 87, onTime: 82, satisfaction: 78, reviews: 15 }, subcategories: ['Oil Change', 'Basic Service'] },
  { name: 'Suman Das', email: 'suman.das@email.com', phone: '9876543228', category: 'tutor', level: 'master', score: 95, exp: 20, city: 6, bio: 'PhD in Mathematics. Former IIT professor. Specializes in JEE/NEET preparation with 90%+ success rate.', pricing: { min: 999, max: 1999 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 456, success: 99, onTime: 100, satisfaction: 98, reviews: 167 }, subcategories: ['Mathematics', 'JEE/NEET Prep', 'Statistics'] },
  { name: 'Neha Agarwal', email: 'neha.agarwal@email.com', phone: '9876543229', category: 'tutor', level: 'skilled', score: 64, exp: 3, city: 7, bio: ' passionate tutor for school and college students in science and mathematics.', pricing: { min: 299, max: 799 }, verified: { identity: true, practicalSkill: true, experience: true, certification: false, background: true }, stats: { jobs: 123, success: 93, onTime: 91, satisfaction: 87, reviews: 45 }, subcategories: ['Mathematics', 'Science', 'English'] },
  { name: 'Aditya Menon', email: 'aditya.m@email.com', phone: '9876543230', category: 'graphicDesigner', level: 'expert', score: 86, exp: 7, city: 5, bio: 'Creative graphic designer with a portfolio of 200+ brands. Expert in UI/UX and brand identity.', pricing: { min: 999, max: 1699 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 312, success: 97, onTime: 94, satisfaction: 93, reviews: 98 }, subcategories: ['Logo Design', 'Brand Kit', 'Banner Design', 'UI/UX Design'] },
  { name: 'Kavitha Sundaram', email: 'kavitha.s@email.com', phone: '9876543231', category: 'graphicDesigner', level: 'basic', score: 45, exp: 1, city: 2, bio: 'Fresh design graduate eager to create impactful visual content.', pricing: { min: 299, max: 799 }, verified: { identity: true, practicalSkill: false, experience: false, certification: false, background: true }, stats: { jobs: 28, success: 88, onTime: 85, satisfaction: 82, reviews: 12 }, subcategories: ['Logo Design', 'Business Card'] },
  { name: 'Rahul Deshpande', email: 'rahul.d@email.com', phone: '9876543232', category: 'webDeveloper', level: 'master', score: 90, exp: 12, city: 0, bio: 'Full-stack developer and tech lead. Expert in MERN stack, cloud deployment, and scalable architecture.', pricing: { min: 4999, max: 19999 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 189, success: 98, onTime: 95, satisfaction: 96, reviews: 67 }, subcategories: ['Business Website', 'E-commerce Store', 'Web Application', 'API Development'] },
  { name: 'Farhan Khan', email: 'farhan.k@email.com', phone: '9876543233', category: 'webDeveloper', level: 'skilled', score: 60, exp: 3, city: 3, bio: 'Frontend-focused web developer with skills in React and responsive design.', pricing: { min: 1999, max: 6999 }, verified: { identity: true, practicalSkill: true, experience: true, certification: false, background: true }, stats: { jobs: 67, success: 92, onTime: 89, satisfaction: 85, reviews: 28 }, subcategories: ['Landing Page', 'Business Website'] },
  { name: 'Shruti Pillai', email: 'shruti.p@email.com', phone: '9876543234', category: 'photographer', level: 'expert', score: 87, exp: 8, city: 1, bio: 'Professional photographer specializing in weddings, portraits, and commercial shoots. Published in Vogue India.', pricing: { min: 1999, max: 8999 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 234, success: 98, onTime: 96, satisfaction: 95, reviews: 89 }, subcategories: ['Portrait Session', 'Event Photography', 'Pre-wedding', 'Product Photography'] },
  { name: 'Kiran Bhat', email: 'kiran.b@email.com', phone: '9876543235', category: 'photographer', level: 'basic', score: 50, exp: 1, city: 4, bio: 'Aspiring photographer with a passion for street photography and portraits.', pricing: { min: 499, max: 1999 }, verified: { identity: true, practicalSkill: false, experience: false, certification: false, background: true }, stats: { jobs: 19, success: 85, onTime: 80, satisfaction: 78, reviews: 8 }, subcategories: ['Portrait Session', 'Product Photography'] },
  { name: 'Manoj Tiwari', email: 'manoj.t@email.com', phone: '9876543236', category: 'electrician', level: 'skilled', score: 56, exp: 3, city: 2, bio: 'Skilled residential electrician with focus on safety and quality workmanship.', pricing: { min: 399, max: 999 }, verified: { identity: true, practicalSkill: true, experience: true, certification: false, background: true }, stats: { jobs: 145, success: 93, onTime: 90, satisfaction: 86, reviews: 56 }, subcategories: ['Wiring Repair', 'Fan Installation'] },
  { name: 'Deepa Krishnan', email: 'deepa.k@email.com', phone: '9876543237', category: 'plumber', level: 'basic', score: 35, exp: 1, city: 5, bio: 'Apprentice plumber learning from experienced professionals.', pricing: { min: 249, max: 699 }, verified: { identity: true, practicalSkill: false, experience: false, certification: false, background: true }, stats: { jobs: 23, success: 87, onTime: 83, satisfaction: 79, reviews: 11 }, subcategories: ['Tap Installation', 'Pipe Repair'] },
  { name: 'Nitin Saxena', email: 'nitin.s@email.com', phone: '9876543238', category: 'carpenter', level: 'skilled', score: 70, exp: 5, city: 7, bio: 'Skilled carpenter with expertise in modular furniture and restoration work.', pricing: { min: 499, max: 1399 }, verified: { identity: true, practicalSkill: true, experience: true, certification: false, background: true }, stats: { jobs: 198, success: 94, onTime: 91, satisfaction: 88, reviews: 72 }, subcategories: ['Furniture Repair', 'Wardrobe Assembly', 'Custom Shelving'] },
  { name: 'Pooja Reddy', email: 'pooja.r@email.com', phone: '9876543239', category: 'beautician', level: 'expert', score: 78, exp: 6, city: 4, bio: 'Expert beautician specializing in bridal makeup and advanced skincare treatments.', pricing: { min: 499, max: 1499 }, verified: { identity: true, practicalSkill: true, experience: true, certification: true, background: true }, stats: { jobs: 345, success: 96, onTime: 94, satisfaction: 92, reviews: 123 }, subcategories: ['Facial', 'Bridal Makeup', 'Hair Color', 'Full Body Wax'] },
  { name: 'Ashok Pillai', email: 'ashok.p@email.com', phone: '9876543240', category: 'acTechnician', level: 'basic', score: 40, exp: 1, city: 4, bio: 'Entry-level AC technician undergoing training in all AC systems.', pricing: { min: 299, max: 799 }, verified: { identity: true, practicalSkill: false, experience: false, certification: false, background: true }, stats: { jobs: 34, success: 86, onTime: 82, satisfaction: 77, reviews: 16 }, subcategories: ['AC Servicing'] }
];

const customerData = [
  { name: 'Aarav Mehta', email: 'aarav.m@email.com', phone: '9123456780', city: 0 },
  { name: 'Diya Kapoor', email: 'diya.k@email.com', phone: '9123456781', city: 1 },
  { name: 'Arjun Malhotra', email: 'arjun.m@email.com', phone: '9123456782', city: 2 },
  { name: 'Sneha Rao', email: 'sneha.r@email.com', phone: '9123456783', city: 3 },
  { name: 'Rohan Gupta', email: 'rohan.g@email.com', phone: '9123456784', city: 4 },
  { name: 'Ishita Bhat', email: 'ishita.b@email.com', phone: '9123456785', city: 5 },
  { name: 'Kabir Singh', email: 'kabir.s@email.com', phone: '9123456786', city: 6 },
  { name: 'Tanya Sharma', email: 'tanya.s@email.com', phone: '9123456787', city: 7 },
  { name: 'Vivaan Patel', email: 'vivaan.p@email.com', phone: '9123456788', city: 0 },
  { name: 'Myra Joshi', email: 'myra.j@email.com', phone: '9123456789', city: 1 },
  { name: 'Reyansh Kumar', email: 'reyansh.k@email.com', phone: '9123456790', city: 2 }
];

function generatePassportId(category) {
  const prefix = category.substring(0, 3).toUpperCase();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `SS-${prefix}-${num}`;
}

async function seed(options = {}) {
  const { clean = true } = options;
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('localhost:27017/skillserve')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { port: 27017, dbPath: require('path').join(__dirname, '.data', 'db'), storageEngine: 'wiredTiger', startupTimeout: 120000 },
        binary: { version: '6.0.14' }
      });
      uri = mongod.getUri('skillserve');
      console.log('Using in-process MongoDB for seeding');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    if (clean) {
      await User.deleteMany({});
      await Worker.deleteMany({});
      await Service.deleteMany({});
      await Booking.deleteMany({});
      await Review.deleteMany({});
      await SkillAssessment.deleteMany({});

      console.log('Cleared existing data');
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@skillserve.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      location: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' }
    });
    console.log('Admin created');

    const serviceDocs = await Service.insertMany(
      services.map((s) => ({
        ...s,
        slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }))
    );
    console.log(`${serviceDocs.length} services created`);

    const customerDocs = [];
    for (const c of customerData) {
      const user = await User.create({
        name: c.name,
        email: c.email,
        password: 'customer123',
        phone: c.phone,
        role: 'customer',
        location: { city: cities[c.city].city, state: cities[c.city].state, pincode: '560001' },
        coordinates: { lat: cities[c.city].lat, lng: cities[c.city].lng }
      });
      customerDocs.push(user);
    }
    console.log(`${customerDocs.length} customers created`);

    const workerDocs = [];
    for (let i = 0; i < workerData.length; i++) {
      const w = workerData[i];
      const c = cities[w.city];

      const user = await User.create({
        name: w.name,
        email: w.email,
        password: 'worker123',
        phone: w.phone,
        role: 'worker',
        location: { city: c.city, state: c.state, pincode: '560001' },
        coordinates: { lat: c.lat + (Math.random() - 0.5) * 0.1, lng: c.lng + (Math.random() - 0.5) * 0.1 }
      });

      const issuanceDate = new Date();
      issuanceDate.setFullYear(issuanceDate.getFullYear() - 1);
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const worker = await Worker.create({
        user: user._id,
        serviceCategory: w.category,
        serviceSubcategories: w.subcategories,
        bio: w.bio,
        experience: w.exp,
        skillLevel: w.level,
        skillScore: {
          overall: w.score,
          practicalTest: Math.min(100, w.score + Math.floor(Math.random() * 8 - 4)),
          verifiedExperience: Math.min(100, w.score + Math.floor(Math.random() * 10 - 5)),
          jobSuccessRate: Math.min(100, w.stats.success + Math.floor(Math.random() * 5)),
          customerFeedback: Math.min(100, w.stats.satisfaction + Math.floor(Math.random() * 5)),
          certification: w.verified.certification ? Math.min(100, 70 + Math.floor(Math.random() * 25)) : Math.floor(Math.random() * 30),
          reliability: Math.min(100, w.stats.onTime + Math.floor(Math.random() * 5))
        },
        pricing: { min: w.pricing.min, max: w.pricing.max, currency: 'INR' },
        workPortfolio: generatePortfolio(w.category),
        certifications: generateCertifications(w.category, w.verified.certification),
        verification: {
          identity: w.verified.identity,
          practicalSkill: w.verified.practicalSkill,
          experience: w.verified.experience,
          certification: w.verified.certification,
          background: w.verified.background,
          overallVerified: w.verified.identity && w.verified.practicalSkill && w.verified.experience && w.verified.certification && w.verified.background
        },
        stats: {
          jobsCompleted: w.stats.jobs,
          successRate: w.stats.success,
          onTimeRate: w.stats.onTime,
          customerSatisfaction: w.stats.satisfaction,
          totalReviews: w.stats.reviews,
          profileViews: Math.floor(Math.random() * 5000) + 500
        },
        availability: {
          isAvailable: true,
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          maxDailyJobs: 5
        },
        skillPassport: {
          passportId: generatePassportId(w.category),
          qrCode: `https://skillserve.in/passport/${generatePassportId(w.category)}`,
          issuedDate: issuanceDate,
          expiryDate: expiryDate
        },
        isFeatured: w.score >= 88
      });

      workerDocs.push(worker);
    }
    console.log(`${workerDocs.length} workers created`);

    const bookingStatuses = ['completed', 'completed', 'completed', 'pending', 'confirmed', 'in_progress', 'completed', 'completed'];
    const reviews = [
      { technicalQuality: 5, professionalism: 5, punctuality: 5, valueForMoney: 4, communication: 5, comment: 'Excellent work! Very professional and timely.' },
      { technicalQuality: 4, professionalism: 5, punctuality: 4, valueForMoney: 5, communication: 4, comment: 'Great service, will book again.' },
      { technicalQuality: 5, professionalism: 4, punctuality: 5, valueForMoney: 5, communication: 5, comment: 'Highly skilled and courteous. Fixed the issue quickly.' },
      { technicalQuality: 4, professionalism: 4, punctuality: 5, valueForMoney: 4, communication: 4, comment: 'Good job, satisfied with the work.' },
      { technicalQuality: 5, professionalism: 5, punctuality: 4, valueForMoney: 5, communication: 5, comment: 'Amazing experience! Highly recommend.' },
      { technicalQuality: 4, professionalism: 4, punctuality: 4, valueForMoney: 4, communication: 4, comment: 'Decent work, fair pricing.' },
      { technicalQuality: 5, professionalism: 5, punctuality: 5, valueForMoney: 4, communication: 5, comment: 'Top-notch quality. Very thorough.' },
      { technicalQuality: 4, professionalism: 5, punctuality: 5, valueForMoney: 5, communication: 4, comment: 'Very happy with the service.' },
      { technicalQuality: 3, professionalism: 4, punctuality: 3, valueForMoney: 4, communication: 3, comment: 'Average service, could be better.' },
      { technicalQuality: 5, professionalism: 5, punctuality: 5, valueForMoney: 5, communication: 5, comment: 'Perfect! Will definitely use again.' },
      { technicalQuality: 4, professionalism: 4, punctuality: 5, valueForMoney: 4, communication: 4, comment: 'Reliable and skilled worker.' },
      { technicalQuality: 5, professionalism: 5, punctuality: 4, valueForMoney: 4, communication: 5, comment: 'Outstanding work quality.' }
    ];

    let bookingCount = 0;
    const completedWorkerIds = [];

    for (let i = 0; i < Math.min(workerDocs.length, 20); i++) {
      const worker = workerDocs[i];
      const numBookings = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numBookings; j++) {
        const customer = customerDocs[Math.floor(Math.random() * customerDocs.length)];
        const service = serviceDocs.find(s => s.category === worker.serviceCategory) || serviceDocs[0];
        const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];

        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 30));

        const price = worker.pricing.min + Math.floor(Math.random() * (worker.pricing.max - worker.pricing.min));

        const booking = await Booking.create({
          customer: customer._id,
          worker: worker._id,
          service: service._id,
          serviceSubcategory: worker.serviceSubcategories[0] || '',
          description: `Need ${service.name} service at my residence`,
          address: {
            street: `${Math.floor(Math.random() * 200) + 1}, Main Street`,
            city: cities[Math.floor(Math.random() * cities.length)].city,
            state: cities[Math.floor(Math.random() * cities.length)].state,
            pincode: '560001',
            coordinates: { lat: 12.97 + Math.random() * 0.1, lng: 77.59 + Math.random() * 0.1 }
          },
          scheduledDate,
          scheduledTime: `${9 + Math.floor(Math.random() * 9)}:00`,
          status,
          price: { estimated: price, final: status === 'completed' ? price + Math.floor(Math.random() * 200) - 100 : undefined, currency: 'INR' },
          paymentStatus: status === 'completed' ? 'paid' : 'pending',
          completedAt: status === 'completed' ? new Date(scheduledDate.getTime() + 86400000) : undefined
        });

        bookingCount++;

        if (status === 'completed' && Math.random() > 0.3) {
          const reviewData = reviews[Math.floor(Math.random() * reviews.length)];
          const overall = Math.round(
            (reviewData.technicalQuality + reviewData.professionalism + reviewData.punctuality +
              reviewData.valueForMoney + reviewData.communication) / 5
          );

          await Review.create({
            booking: booking._id,
            customer: customer._id,
            worker: worker._id,
            ratings: { ...reviewData, overall },
            comment: reviewData.comment,
            isVerified: true
          });

          if (!completedWorkerIds.includes(worker._id.toString())) {
            completedWorkerIds.push(worker._id.toString());
          }
        }
      }
    }
    console.log(`${bookingCount} bookings created with reviews`);

    for (const workerId of completedWorkerIds.slice(0, 10)) {
      const worker = await Worker.findById(workerId);
      if (worker) {
        const category = worker.serviceCategory;
        if (assessmentTemplates[category]) {
          const template = assessmentTemplates[category];
          const maxScore = template.questions.reduce((sum, q) => sum + q.points, 0);
          const percentage = worker.skillScore.overall;
          const score = Math.round(maxScore * percentage / 100);

          await SkillAssessment.create({
            worker: workerId,
            serviceCategory: category,
            assessmentTitle: template.title,
            questions: template.questions.map(q => ({
              question: q.question,
              type: q.type,
              options: q.options,
              correctAnswer: q.correctAnswer,
              points: q.points,
              rubric: q.rubric
            })),
            score,
            maxScore,
            percentage,
            passed: percentage >= 60,
            level: worker.skillLevel,
            attemptedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
            timeSpent: Math.floor(Math.random() * 30) + 10
          });
        }
      }
    }
    console.log('Assessments created');

    console.log('\n=== Seed Complete ===');
    console.log(`Admin: admin@skillserve.com / admin123`);
    console.log(`Workers: ${workerDocs.length} (login with any worker email / worker123)`);
    console.log(`Customers: ${customerDocs.length} (login with any customer email / customer123)`);
    console.log(`Bookings: ${bookingCount}`);
    console.log(`Services: ${serviceDocs.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

function generatePortfolio(category) {
  const portfolios = {
    electrician: [
      { title: 'Complete House Rewiring', description: 'Full rewiring of a 3BHK apartment with safetycompliant MCB panel', images: [] },
      { title: 'Smart Home Installation', description: 'Installed smart switches, automated lighting, and CCTV for a villa', images: [] },
      { title: 'Industrial Electrical Maintenance', description: 'Monthly maintenance contract for a 50-unit commercial complex', images: [] }
    ],
    plumber: [
      { title: 'Bathroom Renovation', description: 'Complete bathroom renovation with modern fittings and waterproofing', images: [] },
      { title: 'Water Tank Installation', description: 'Installed and connected overhead and underground water tanks', images: [] },
      { title: 'Leak Detection and Repair', description: 'Successfully detected and repaired hidden pipe leak in a heritage building', images: [] }
    ],
    carpenter: [
      { title: 'Custom Teak Wood Furniture', description: 'Handcrafted teak wood dining set and TV unit for a premium apartment', images: [] },
      { title: 'Modular Kitchen Installation', description: 'Complete modular kitchen with soft-close drawers and chimney setup', images: [] },
      { title: 'Door and Frame Replacement', description: 'Replaced all doors and frames in a 4BHK with moisture-resistant material', images: [] }
    ],
    acTechnician: [
      { title: 'Centralized AC Installation', description: 'Installed 5-ton ducted AC system for a commercial office space', images: [] },
      { title: 'Annual Maintenance Contract', description: 'AMC for 50+ split ACs in a corporate building', images: [] },
      { title: 'Inverter AC Repair', description: 'Diagnosed and fixed compressor issue in a Daikin inverter AC', images: [] }
    ],
    painter: [
      { title: 'Premium Texture Painting', description: 'Royal Play texture finish for a luxury apartment living room', images: [] },
      { title: 'Complete Home Painting', description: 'Interior and exterior painting for a 2BHK with Asian Paints', images: [] },
      { title: 'Waterproof Exterior Coating', description: 'Applied Dr. Fixit waterproof coating for a terrace and exterior walls', images: [] }
    ],
    beautician: [
      { title: 'Bridal Package', description: 'Complete bridal beauty package including hair, makeup, and mehendi', images: [] },
      { title: 'Korean Glass Facial', description: 'Advanced Korean skincare facial for a client with acne scarring', images: [] },
      { title: 'Hair Color Transformation', description: 'Balayage hair color treatment with Olaplex treatment', images: [] }
    ],
    applianceRepair: [
      { title: 'Washing Machine Overhaul', description: 'Complete overhaul of LG front-load washing machine including drum replacement', images: [] },
      { title: 'Refrigerator Compressor Replacement', description: 'Replaced compressor in a Samsung double-door refrigerator', images: [] },
      { title: 'Microwave Magnetron Replacement', description: 'Fixed heating issue in IFB microwave by replacing magnetron', images: [] }
    ],
    cleaning: [
      { title: 'Deep Home Cleaning', description: 'Complete deep cleaning of a 3BHK with sanitization for a new move-in', images: [] },
      { title: 'Post-Construction Cleaning', description: 'Intensive cleaning of a newly constructed 4BHK house', images: [] },
      { title: 'Sofa and Carpet Cleaning', description: 'Steam cleaned 8-seater sofa set and wall-to-wall carpeting', images: [] }
    ],
    mechanic: [
      { title: 'Complete Bike Service', description: 'Full service including oil change, brake adjustment, and chain lubrication', images: [] },
      { title: 'Car AC Repair', description: 'Fixed car AC compressor and recharged refrigerant for a Hyundai Creta', images: [] },
      { title: 'Engine Tune-up', description: 'Complete engine tune-up including spark plug replacement and filter change', images: [] }
    ],
    tutor: [
      { title: 'JEE Main Preparation', description: 'Guided 15 students to clear JEE Main with 95+ percentile', images: [] },
      { title: 'CBSE 10th Board Coaching', description: 'Mathematics and Science coaching with 100% pass rate', images: [] },
      { title: 'Spoken English Course', description: '3-month intensive English speaking and writing course', images: [] }
    ],
    graphicDesigner: [
      { title: 'Brand Identity for Startup', description: 'Complete brand kit including logo, business cards, and letterhead', images: [] },
      { title: 'Restaurant Menu Design', description: 'Designed premium menu card for a fine dining restaurant chain', images: [] },
      { title: 'Social Media Campaign', description: 'Created 30-day social media content calendar with graphics', images: [] }
    ],
    webDeveloper: [
      { title: 'E-commerce Website', description: 'Built a full-stack e-commerce platform with payment integration', images: [] },
      { title: 'Restaurant Website', description: 'Designed and developed a responsive restaurant website with online ordering', images: [] },
      { title: 'Real Estate Portal', description: 'Developed a property listing portal with search and filtering', images: [] }
    ],
    photographer: [
      { title: 'Wedding Photography', description: 'Shot a 3-day wedding event with 2000+ edited photos', images: [] },
      { title: 'Corporate Headshots', description: 'Professional headshot session for 50+ employees', images: [] },
      { title: 'Product Photography', description: 'Studio product photography for an e-commerce brand', images: [] }
    ]
  };

  return portfolios[category] || [{ title: 'Professional Service', description: 'Quality service delivery', images: [] }];
}

function generateCertifications(category, hasCerts) {
  if (!hasCerts) return [];

  const certs = {
    electrician: [
      { name: 'ITI Electrician Certificate', issuer: 'NCVT', date: new Date('2015-06-15'), verified: true },
      { name: 'Wireman License', issuer: 'State Electricity Board', date: new Date('2016-03-20'), expiryDate: new Date('2026-03-20'), verified: true },
      { name: 'Smart Home Installation Certified', issuer: 'Honeywell Academy', date: new Date('2022-08-10'), verified: true }
    ],
    plumber: [
      { name: 'ITI Plumber Certificate', issuer: 'NCVT', date: new Date('2014-05-20'), verified: true },
      { name: 'Certified Plumbing Professional', issuer: 'Indian Plumbing Association', date: new Date('2018-11-15'), verified: true },
      { name: 'Waterproofing Specialist', issuer: 'Dr. Fixit Academy', date: new Date('2021-04-22'), verified: true }
    ],
    carpenter: [
      { name: 'National Carpenter Certificate', issuer: 'NSDC', date: new Date('2012-08-10'), verified: true },
      { name: 'Modular Kitchen Installation', issuer: 'Elica Academy', date: new Date('2020-06-18'), verified: true },
      { name: 'Furniture Design Diploma', issuer: 'NID Ahmedabad', date: new Date('2015-12-20'), verified: true }
    ],
    acTechnician: [
      { name: 'Daikin Certified Technician', issuer: 'Daikin India', date: new Date('2017-09-15'), expiryDate: new Date('2025-09-15'), verified: true },
      { name: 'Voltas Authorized Service Partner', issuer: 'Voltas Ltd', date: new Date('2019-03-22'), verified: true },
      { name: 'Refrigerant Handling Certificate', issuer: 'ASEAN Council', date: new Date('2020-07-10'), verified: true }
    ],
    painter: [
      { name: 'Certified Painting Professional', issuer: 'Asian Paints', date: new Date('2018-05-20'), verified: true },
      { name: 'Texture Application Specialist', issuer: 'Berger Paints', date: new Date('2020-11-15'), verified: true }
    ],
    beautician: [
      { name: 'International Beauty Therapy Diploma', issuer: 'CIDESCO', date: new Date('2016-08-25'), verified: true },
      { name: 'Advanced Hair Color Certification', issuer: 'Loreal Academy', date: new Date('2019-04-18'), verified: true },
      { name: 'Korean Skincare Specialist', issuer: 'Korean Beauty Academy', date: new Date('2022-02-10'), verified: true }
    ],
    applianceRepair: [
      { name: 'Samsung Authorized Service Partner', issuer: 'Samsung India', date: new Date('2018-07-20'), verified: true },
      { name: 'LG Certified Technician', issuer: 'LG Electronics', date: new Date('2019-11-15'), verified: true },
      { name: 'Bosch Service Excellence', issuer: 'Bosch India', date: new Date('2021-05-10'), verified: true }
    ],
    cleaning: [
      { name: 'Professional Cleaning Certification', issuer: 'ISSA', date: new Date('2019-09-20'), verified: true },
      { name: 'Green Cleaning Specialist', issuer: 'Indian Green Building Council', date: new Date('2021-03-15'), verified: true }
    ],
    mechanic: [
      { name: 'Motor Vehicle Mechanic Certificate', issuer: 'NCVT', date: new Date('2015-06-20'), verified: true },
      { name: 'Two-Wheeler Expert', issuer: 'Hero MotoCorp Academy', date: new Date('2018-08-10'), verified: true }
    ],
    tutor: [
      { name: 'B.Ed Mathematics', issuer: 'Delhi University', date: new Date('2010-06-15'), verified: true },
      { name: 'JEE Coaching Certification', issuer: 'FIITJEE Academy', date: new Date('2016-09-20'), verified: true },
      { name: 'PhD Mathematics', issuer: 'IIT Bombay', date: new Date('2008-12-10'), verified: true }
    ],
    graphicDesigner: [
      { name: 'Adobe Certified Expert', issuer: 'Adobe', date: new Date('2019-06-15'), verified: true },
      { name: 'UI/UX Design Specialization', issuer: 'Coursera/Google', date: new Date('2021-03-20'), verified: true }
    ],
    webDeveloper: [
      { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: new Date('2020-08-10'), expiryDate: new Date('2024-08-10'), verified: true },
      { name: 'MERN Stack Masterclass', issuer: 'Udemy', date: new Date('2019-05-20'), verified: true },
      { name: 'Google Cloud Certified', issuer: 'Google', date: new Date('2021-11-15'), verified: true }
    ],
    photographer: [
      { name: 'Professional Photography Diploma', issuer: 'Photography Institute of India', date: new Date('2018-04-20'), verified: true },
      { name: 'Adobe Lightroom Certified', issuer: 'Adobe', date: new Date('2020-09-10'), verified: true }
    ]
  };

  return certs[category] || [];
}

const assessmentTemplates = {
  electrician: {
    title: 'Electrician Skill Assessment',
    questions: [
      { question: 'A circuit breaker keeps tripping. What is the MOST likely cause?', type: 'theoretical', options: ['Overloaded circuit', 'Decorative switch plate', 'New paint on walls', 'Loose chandelier'], correctAnswer: 'Overloaded circuit', points: 10, rubric: 'Basic circuit protection knowledge' },
      { question: 'What is the correct wire gauge for a 15-amp household circuit in India?', type: 'theoretical', options: ['1.5 sq mm', '2.5 sq mm', '6 sq mm', '0.5 sq mm'], correctAnswer: '2.5 sq mm', points: 10, rubric: 'Knows IS wiring standards' },
      { question: 'Describe the steps to safely isolate a circuit before repair.', type: 'scenario', options: [], correctAnswer: 'Turn off MCB, verify no voltage with tester', points: 15, rubric: 'Safety-first isolation procedure' },
      { question: 'How do you diagnose a tripping RCCB without visible damage?', type: 'scenario', options: [], correctAnswer: 'Isolate branches and test each circuit', points: 15, rubric: 'Systematic fault isolation' },
      { question: 'What color is the earth wire in Indian 3-core wiring?', type: 'theoretical', options: ['Green', 'Red', 'Blue', 'Black'], correctAnswer: 'Green', points: 5, rubric: 'Wire color identification' },
      { question: 'Which tool is used to measure continuity in a circuit?', type: 'theoretical', options: ['Multimeter', 'Hammer', 'Voltage tester screwdriver', 'Wire stripper'], correctAnswer: 'Multimeter', points: 5, rubric: 'Tool identification' },
      { question: 'A ceiling fan motor hums but does not spin. What is the likely fault?', type: 'scenario', options: [], correctAnswer: 'Capacitor may be dead', points: 15, rubric: 'Motor fault diagnosis' },
      { question: 'What is the maximum load in watts for a 5-amp circuit at 230V?', type: 'theoretical', options: ['1150W', '2300W', '500W', '575W'], correctAnswer: '1150W', points: 10, rubric: 'Electrical load calculation' },
      { question: 'When installing a new socket, what safety check must you perform FIRST?', type: 'scenario', options: [], correctAnswer: 'Confirm power is off and circuit isolated', points: 15, rubric: 'Safety over speed' },
      { question: 'Which component protects against earth leakage?', type: 'theoretical', options: ['RCCB', 'MCB', 'Fuse', 'Switch'], correctAnswer: 'RCCB', points: 10, rubric: 'Protective device knowledge' }
    ]
  },
  plumber: {
    title: 'Plumber Skill Assessment',
    questions: [
      { question: 'A tap keeps dripping. What is the most common cause?', type: 'theoretical', options: ['Worn washer / seal', 'High water pressure only', 'Old paint', 'Loose wall tile'], correctAnswer: 'Worn washer / seal', points: 10, rubric: 'Basic tap repair' },
      { question: 'Which pipe material is most commonly used for concealed plumbing in India?', type: 'theoretical', options: ['CPVC', 'Cast iron', 'Lead', 'Wood'], correctAnswer: 'CPVC', points: 10, rubric: 'Material knowledge' },
      { question: 'How do you detect a hidden water leak in a wall?', type: 'scenario', options: [], correctAnswer: 'Check pressure drop and moisture, isolate sections', points: 15, rubric: 'Leak diagnosis methodology' },
      { question: 'What is the recommended slope for a waste water drain pipe?', type: 'theoretical', options: ['1:40 to 1:100', '1:5', '1:1', 'No slope needed'], correctAnswer: '1:40 to 1:100', points: 10, rubric: 'Drainage standards' },
      { question: 'A toilet tank does not stop filling. Which part is likely faulty?', type: 'theoretical', options: ['Float valve', 'Toilet seat', 'Tank bolts', 'Flush handle'], correctAnswer: 'Float valve', points: 10, rubric: 'Toilet mechanism knowledge' },
      { question: 'Describe how to fix a noisy water hammer in a pipe.', type: 'scenario', options: [], correctAnswer: 'Fit air chamber or pressure reducing valve', points: 15, rubric: 'Advanced plumbing fix' },
      { question: 'Which solvent is used to join CPVC pipes?', type: 'theoretical', options: ['CPVC solvent cement', 'Fevicol', 'Plumbing tape only', 'Silicone grease'], correctAnswer: 'CPVC solvent cement', points: 5, rubric: 'Joining technique' },
      { question: 'What is the purpose of a pressure reducing valve?', type: 'theoretical', options: ['Reduce inlet pressure to safe level', 'Increase pump speed', 'Filter water', 'Heat water'], correctAnswer: 'Reduce inlet pressure to safe level', points: 10, rubric: 'System components' },
      { question: 'A geyser leaks from the safety valve. What should you check?', type: 'scenario', options: [], correctAnswer: 'Inlet pressure and thermal expansion', points: 15, rubric: 'Heating system diagnosis' },
      { question: 'Which tool is used to tighten a compression fitting?', type: 'theoretical', options: ['Adjustable spanner', 'Chisel', 'Hacksaw', 'Screwdriver'], correctAnswer: 'Adjustable spanner', points: 10, rubric: 'Tool identification' }
    ]
  },
  carpenter: {
    title: 'Carpenter Skill Assessment',
    questions: [
      { question: 'What is the standard height of a kitchen counter top?', type: 'theoretical', options: ['85-90 cm', '60 cm', '120 cm', '40 cm'], correctAnswer: '85-90 cm', points: 10, rubric: 'Ergonomic standards' },
      { question: 'Which wood is best for outdoor furniture in humid climates?', type: 'theoretical', options: ['Teak', 'Pine', 'MDF', 'Particle board'], correctAnswer: 'Teak', points: 10, rubric: 'Material selection' },
      { question: 'A door frame is warped. How do you fix it?', type: 'scenario', options: [], correctAnswer: 'Remove and reinstall with proper level, or plane the edge', points: 15, rubric: 'Frame repair methodology' },
      { question: 'What tool is used to make a 45-degree cut on wood?', type: 'theoretical', options: ['Mitre saw', 'Circular saw at 90', 'Jigsaw', 'Hand plane'], correctAnswer: 'Mitre saw', points: 5, rubric: 'Tool identification' },
      { question: 'How do you strengthen a loose wooden chair joint?', type: 'scenario', options: [], correctAnswer: 'Glue, dowel or steel bracket reinforcement', points: 15, rubric: 'Joint repair' },
      { question: 'Which type of plywood is used for kitchen cabinets?', type: 'theoretical', options: ['Marine grade', 'Commercial grade', 'Cardboard', 'Fiberboard only'], correctAnswer: 'Marine grade', points: 10, rubric: 'Grade selection' },
      { question: 'What is the function of a pocket hole jig?', type: 'theoretical', options: ['Create angled screw holes', 'Measure angles', 'Cut circles', 'Sand edges'], correctAnswer: 'Create angled screw holes', points: 5, rubric: 'Modern joinery tool' },
      { question: 'A drawer does not slide smoothly. What do you check first?', type: 'scenario', options: [], correctAnswer: 'Runners and alignment, then lubrication', points: 15, rubric: 'Furniture mechanism' },
      { question: 'Which is the best fastening method for heavy shelf supports?', type: 'theoretical', options: ['Wall anchors and screws', 'Nails only', 'Glue only', 'Tape'], correctAnswer: 'Wall anchors and screws', points: 10, rubric: 'Structural fastening' },
      { question: 'How do you calculate the quantity of laminate needed for a table top?', type: 'scenario', options: [], correctAnswer: 'Measure surface + overhang + wastage margin', points: 15, rubric: 'Material estimation' }
    ]
  },
  acTechnician: {
    title: 'AC Technician Assessment',
    questions: [
      { question: 'A split AC cools poorly but runs continuously. Likely cause?', type: 'theoretical', options: ['Low refrigerant', 'Dirty remote', 'Wrong voltage paint', 'High setting only'], correctAnswer: 'Low refrigerant', points: 10, rubric: 'Cooling issue diagnosis' },
      { question: 'Which gas is commonly used in modern ACs in India?', type: 'theoretical', options: ['R32', 'R22', 'Ammonia', 'Helium'], correctAnswer: 'R32', points: 10, rubric: 'Refrigerant knowledge' },
      { question: 'Water is leaking from the indoor unit. What do you inspect?', type: 'scenario', options: [], correctAnswer: 'Drain pipe clog, condensate tray level', points: 15, rubric: 'Condensate management' },
      { question: 'What is the purpose of a capacitor in an AC compressor?', type: 'theoretical', options: ['Start and run the compressor motor', 'Filter air', 'Cool the gas', 'Connect to wifi'], correctAnswer: 'Start and run the compressor motor', points: 10, rubric: 'Electrical component knowledge' },
      { question: 'What pressure should R32 be charged to?', type: 'theoretical', options: ['~120-140 psi low side approx by spec', 'Always 500 psi', 'Any pressure', 'Zero pressure'], correctAnswer: '~120-140 psi low side approx by spec', points: 10, rubric: 'Refrigeration pressure specs' },
      { question: 'Describe the correct procedure to evacuate and charge an AC after repair.', type: 'scenario', options: [], correctAnswer: 'Leak test, vacuum pump evacuation, weigh in charge', points: 15, rubric: 'Service procedure correctness' },
      { question: 'A thermostat display shows E1 error. What does it usually indicate?', type: 'theoretical', options: ['Sensor/temp probe fault', 'Remote battery', 'Dirty filter only', 'Nothing'], correctAnswer: 'Sensor/temp probe fault', points: 10, rubric: 'Error code knowledge' },
      { question: 'What tool is used to measure refrigerant pressure?', type: 'theoretical', options: ['Manifold gauge set', 'Multimeter', 'Clamp meter', 'Thermometer'], correctAnswer: 'Manifold gauge set', points: 5, rubric: 'Tool knowledge' },
      { question: 'Why is the outdoor unit placed with clearance around it?', type: 'theoretical', options: ['For proper airflow and heat dissipation', 'For aesthetics', 'To avoid rain', 'To be taller than plants'], correctAnswer: 'For proper airflow and heat dissipation', points: 10, rubric: 'Installation standards' },
      { question: 'A new AC trips the MCB immediately. What do you check first?', type: 'scenario', options: [], correctAnswer: 'Correct breaker rating and short circuit in wiring', points: 15, rubric: 'Electrical safety on install' }
    ]
  },
  painter: {
    title: 'Painter Skill Assessment',
    questions: [
      { question: 'What is the correct order of interior wall painting?', type: 'theoretical', options: ['Primer then two finish coats', 'Finish coat then primer', 'Only one coat', 'Thinner only'], correctAnswer: 'Primer then two finish coats', points: 10, rubric: 'Application order' },
      { question: 'Which paint type is best for high-humidity bathrooms?', type: 'theoretical', options: ['Epoxy/anti-fungal', 'Matte distemper', 'Chalk paint', 'Oil enamel only'], correctAnswer: 'Epoxy/anti-fungal', points: 10, rubric: 'Paint selection' },
      { question: 'How do you prepare a wall with cracks before painting?', type: 'scenario', options: [], correctAnswer: 'Scrape, fill with putty, sand smooth, clean', points: 15, rubric: 'Surface prep methodology' },
      { question: 'What does the fineness of a paint roller affect?', type: 'theoretical', options: ['Texture and finish quality', 'Paint color', 'Wall moisture', 'Drying time only'], correctAnswer: 'Texture and finish quality', points: 5, rubric: 'Application tool knowledge' },
      { question: 'How much paint is needed for a 10x12 ft room with 10 ft ceiling?', type: 'scenario', options: [], correctAnswer: 'Calculate wall area, account 10% wastage, ~3-4L per coat', points: 15, rubric: 'Estimation accuracy' },
      { question: 'What is the purpose of a primer coat?', type: 'theoretical', options: ['Adhesion and uniform base', 'Add color', 'Increase gloss', 'Reduce drying time of paint'], correctAnswer: 'Adhesion and uniform base', points: 10, rubric: 'Coating science' },
      { question: 'Which finish is most durable for wood doors?', type: 'theoretical', options: ['Polyurethane', 'Matte acrylic flat', 'Watercolor', 'None'], correctAnswer: 'Polyurethane', points: 10, rubric: 'Finish durability' },
      { question: 'How do you avoid brush marks on a smooth finish?', type: 'scenario', options: [], correctAnswer: 'Use proper brush, thin coats, keep wet edge', points: 15, rubric: 'Technique quality' },
      { question: 'What is the ideal time between coats?', type: 'theoretical', options: ['As per paint label drying time', 'Immediately', 'One month', 'One week for all paints'], correctAnswer: 'As per paint label drying time', points: 10, rubric: 'Recoat timing' },
      { question: 'Which tool is used for precise corner painting?', type: 'theoretical', options: ['Angled brush / cutting-in brush', 'Large roller', 'Spray gun at low', 'Cloth'], correctAnswer: 'Angled brush / cutting-in brush', points: 10, rubric: 'Tool selection' }
    ]
  },
  applianceRepair: {
    title: 'Appliance Repair Assessment',
    questions: [
      { question: 'A washing machine leaks water during spin. Likely fault?', type: 'theoretical', options: ['Door seal or drain hose', 'Wifi module', 'Control knob only', 'Nothing'], correctAnswer: 'Door seal or drain hose', points: 10, rubric: 'Drum seal diagnosis' },
      { question: 'A refrigerator cools but the freezer is too warm. Cause?', type: 'theoretical', options: ['Damper/fan or defrost issue', 'Too many magnets', 'Bulb type', 'gasket only'], correctAnswer: 'Damper/fan or defrost issue', points: 10, rubric: 'Refrigeration split diagnosis' },
      { question: 'How do you test a microwave magnetron?', type: 'scenario', options: [], correctAnswer: 'Check diode continuity, capacitor discharge, high voltage', points: 15, rubric: 'Microwave high-voltage safety' },
      { question: 'What safety step must you take before opening any appliance?', type: 'theoretical', options: ['Unplug and discharge capacitors', 'Call customer', 'Read manual only', 'Wear gloves only'], correctAnswer: 'Unplug and discharge capacitors', points: 15, rubric: 'Electrical safety' },
      { question: 'A water heater trips its breaker. What do you suspect?', type: 'theoretical', options: ['Heating element short / earth fault', 'Cold weather', 'Water color', 'Pressure'], correctAnswer: 'Heating element short / earth fault', points: 10, rubric: 'Heater fault diagnosis' },
      { question: 'Which meter setting is used to test a heating element?', type: 'theoretical', options: ['Resistance (Ohms)', 'Voltage AC', 'Current clamp', 'Capacitance'], correctAnswer: 'Resistance (Ohms)', points: 5, rubric: 'Meter usage' },
      { question: 'A cooler/fan motor runs slow and heats up. Likely issue?', type: 'scenario', options: [], correctAnswer: 'Worn bearings or capacitor failure', points: 15, rubric: 'Motor diagnosis' },
      { question: 'What does a clicking sound in a refrigerator indicate?', type: 'theoretical', options: ['Compressor relay/start issues', 'Water dispenser normal', 'Bulb normal', 'Nothing'], correctAnswer: 'Compressor relay/start issues', points: 10, rubric: 'Compressor electrical diagnosis' },
      { question: 'Describe how to test a thermal fuse or thermostat safely.', type: 'scenario', options: [], correctAnswer: 'Isolate, check continuity with multimeter after power off', points: 15, rubric: 'Component testing' },
      { question: 'Which appliance part would you NOT repair with a basic multimeter?', type: 'theoretical', options: ['High-voltage transformer testing without training', 'Fan speed selector', 'Heating element', 'Thermostat'], correctAnswer: 'High-voltage transformer testing without training', points: 10, rubric: 'Safety awareness' }
    ]
  },
  beautician: {
    title: 'Beautician Skill Assessment',
    questions: [
      { question: 'What skin type suits a hydrating facial?', type: 'theoretical', options: ['Dry and dehydrated', 'Oily only', 'All types equally', 'None'], correctAnswer: 'Dry and dehydrated', points: 10, rubric: 'Skin analysis' },
      { question: 'Which tool must be sanitized between every client?', type: 'theoretical', options: ['All metal tools', 'Only new tools', 'Only scissors', 'None'], correctAnswer: 'All metal tools', points: 10, rubric: 'Hygiene standard' },
      { question: 'A client has an allergic reaction during a facial. What do you do first?', type: 'scenario', options: [], correctAnswer: 'Remove product, rinse, stop service, recommend care', points: 15, rubric: 'Emergency handling' },
      { question: 'What is the SPF level recommended for daily sunscreen?', type: 'theoretical', options: ['SPF 30 minimum', 'SPF 5', 'SPF 10', 'No SPF needed indoors'], correctAnswer: 'SPF 30 minimum', points: 5, rubric: 'Sun care knowledge' },
      { question: 'How do you choose the right foundation shade?', type: 'scenario', options: [], correctAnswer: 'Test on jawline in natural light, match undertone', points: 15, rubric: 'Color matching skill' },
      { question: 'Which product is used to remove makeup safely?', type: 'theoretical', options: ['Micellar water / makeup remover', 'Soap bar', 'Handwash', 'Alkaline scrub'], correctAnswer: 'Micellar water / makeup remover', points: 5, rubric: 'Product knowledge' },
      { question: 'How often should brushes be deep-cleaned?', type: 'theoretical', options: ['Weekly minimum', 'Yearly', 'Never', 'Monthly only for lip brushes'], correctAnswer: 'Weekly minimum', points: 10, rubric: 'Tool hygiene' },
      { question: 'A facial requires steam. Which skin condition should avoid steaming?', type: 'theoretical', options: ['Sensitive/rosacea or broken skin', 'Dry skin', 'Oily skin', 'Normal skin'], correctAnswer: 'Sensitive/rosacea or broken skin', points: 10, rubric: 'Contraindication knowledge' },
      { question: 'Describe a safe eyebrow shaping procedure.', type: 'scenario', options: [], correctAnswer: 'Measure proportion, sanitize, shape below brow line', points: 15, rubric: 'Brow technique' },
      { question: 'Which product goes on FIRST in a skincare routine?', type: 'theoretical', options: ['Cleanser then toner/serum', 'Moisturizer', 'Sunscreen', 'Makeup'], correctAnswer: 'Cleanser then toner/serum', points: 10, rubric: 'Skincare layering' }
    ]
  },
  mechanic: {
    title: 'Mechanic Skill Assessment',
    questions: [
      { question: 'An engine misfires at idle. Likely cause?', type: 'theoretical', options: ['Spark plug / coil issue', 'Fuel gauge only', 'Wind noise', 'Tyre pressure'], correctAnswer: 'Spark plug / coil issue', points: 10, rubric: 'Engine diagnosis' },
      { question: 'What does a knocking sound on cold start usually indicate?', type: 'scenario', options: [], correctAnswer: 'Worn bearings or low oil pressure', points: 15, rubric: 'Engine noise diagnosis' },
      { question: 'Which fluid has a reddish color in most cars?', type: 'theoretical', options: ['Coolant/transmission fluid', 'Engine oil', 'Brake fluid only', 'Windshield washer'], correctAnswer: 'Coolant/transmission fluid', points: 5, rubric: 'Fluid identification' },
      { question: 'What is the correct torque procedure for a cylinder head?', type: 'scenario', options: [], correctAnswer: 'Follow spec sequence in stages with torque wrench', points: 15, rubric: 'Precision mechanical work' },
      { question: 'A brake pedal feels spongy. What do you check?', type: 'theoretical', options: ['Brake fluid level & bleeding', 'Tyre thread', 'Suspension bush', 'Air filter'], correctAnswer: 'Brake fluid level & bleeding', points: 10, rubric: 'Brake system' },
      { question: 'Which tool measures battery voltage?', type: 'theoretical', options: ['Multimeter', 'Calipers', 'Timing light', 'Oil filter wrench'], correctAnswer: 'Multimeter', points: 5, rubric: 'Tool selection' },
      { question: 'How do you test if an alternator is charging correctly?', type: 'scenario', options: [], correctAnswer: 'Measure battery voltage with engine running (13.5-14.5V)', points: 15, rubric: 'Charging system diagnosis' },
      { question: 'What is the recommended tyre pressure check frequency?', type: 'theoretical', options: ['Monthly / before long trips', 'Once a year', 'Never', 'Only after puncture'], correctAnswer: 'Monthly / before long trips', points: 5, rubric: 'Maintenance schedule' },
      { question: 'A car overheats. List the first three things to inspect.', type: 'scenario', options: [], correctAnswer: 'Coolant level, fan operation, radiator/thermostat', points: 15, rubric: 'Overheating diagnosis' },
      { question: 'Which gasket replaces after removing the cylinder head?', type: 'theoretical', options: ['Head gasket', 'Door seal', 'Wheel bearing', 'Cabin filter'], correctAnswer: 'Head gasket', points: 10, rubric: 'Component knowledge' }
    ]
  },
  tutor: {
    title: 'Tutor Skill Assessment',
    questions: [
      { question: 'A student struggles with fractions. What is the best first step?', type: 'scenario', options: [], correctAnswer: 'Assess foundation with simple problems, build incrementally', points: 15, rubric: 'Diagnostic teaching' },
      { question: 'How do you adapt a lesson for a visual learner?', type: 'theoretical', options: ['Use diagrams and visual aids', 'Only oral repetition', 'More homework', 'Longer lectures'], correctAnswer: 'Use diagrams and visual aids', points: 10, rubric: 'Learning styles' },
      { question: 'What is the equation for quadratic roots?', type: 'theoretical', options: ['Quadratic formula: x=(-b±√(b²-4ac))/2a', 'x=a+b', 'x=b/a', 'x=a²+b²'], correctAnswer: 'Quadratic formula: x=(-b±√(b²-4ac))/2a', points: 5, rubric: 'Subject mastery' },
      { question: 'A student is anxious before exams. How do you support them?', type: 'scenario', options: [], correctAnswer: 'Build structured revision plan, practice mock tests, reduce pressure', points: 15, rubric: 'Emotional support' },
      { question: 'What is the SI unit of force?', type: 'theoretical', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correctAnswer: 'Newton', points: 5, rubric: 'Science basics' },
      { question: 'How do you explain a complex concept simply?', type: 'scenario', options: [], correctAnswer: 'Use analogies and break into small steps, check understanding', points: 15, rubric: 'Communication skill' },
      { question: 'Which prep strategy is best for JEE multiple-choice?', type: 'theoretical', options: ['Concept mastery + timed mock tests', 'Memorizing only answers', 'Skipping practice', 'Only theory reading'], correctAnswer: 'Concept mastery + timed mock tests', points: 10, rubric: 'Exam strategy' },
      { question: 'What is 15% of 240?', type: 'theoretical', options: ['36', '39', '48', '24'], correctAnswer: '36', points: 5, rubric: 'Arithmetic accuracy' },
      { question: 'A parent wants weekly progress reports. What do you provide?', type: 'scenario', options: [], correctAnswer: 'Topics covered, strengths, gaps, practice plan', points: 15, rubric: 'Parent communication' },
      { question: 'Which statement best describes inductive teaching?', type: 'theoretical', options: ['Teach specific examples to derive general rule', 'Only rules lecture', 'No examples', 'Only memorization'], correctAnswer: 'Teach specific examples to derive general rule', points: 10, rubric: 'Pedagogy knowledge' }
    ]
  },
  graphicDesigner: {
    title: 'Graphic Design Assessment',
    questions: [
      { question: 'What is the ideal DPI for print design?', type: 'theoretical', options: ['300 DPI', '72 DPI', '24 DPI', '50 DPI'], correctAnswer: '300 DPI', points: 10, rubric: 'Print preparation' },
      { question: 'Which color space is used for printing?', type: 'theoretical', options: ['CMYK', 'RGB', 'HSL', 'LAB only'], correctAnswer: 'CMYK', points: 10, rubric: 'Color management' },
      { question: 'A logo must be scalable. Which format is best?', type: 'theoretical', options: ['SVG (vector)', 'JPG', 'PNG only', 'GIF'], correctAnswer: 'SVG (vector)', points: 5, rubric: 'File format knowledge' },
      { question: 'Describe how you handle a client with vague design feedback.', type: 'scenario', options: [], correctAnswer: 'Ask specific questions, show options, align on objective', points: 15, rubric: 'Client communication' },
      { question: 'What does a bleed in print design mean?', type: 'theoretical', options: ['Extra area beyond trim edge', 'Color overlay', 'White border', 'Vector path'], correctAnswer: 'Extra area beyond trim edge', points: 10, rubric: 'Print terms' },
      { question: 'Which principle keeps a layout balanced?', type: 'scenario', options: [], correctAnswer: 'Visual weight distribution, grid alignment', points: 15, rubric: 'Layout composition' },
      { question: 'What is the purpose of a design system?', type: 'theoretical', options: ['Consistent reusable components/style', 'Random colors', 'Avoid testing', 'Only logos'], correctAnswer: 'Consistent reusable components/style', points: 10, rubric: 'Systems thinking' },
      { question: 'What file type supports transparency for web?', type: 'theoretical', options: ['PNG', 'JPG', 'BMP', 'GIF without alpha'], correctAnswer: 'PNG', points: 5, rubric: 'Format knowledge' },
      { question: 'How do you ensure text is readable in a hero banner?', type: 'scenario', options: [], correctAnswer: 'Contrast, spacing, overlay/gradient behind text', points: 15, rubric: 'Typography & contrast' },
      { question: 'Which tool is industry standard for UI mockups?', type: 'theoretical', options: ['Figma', 'MS Paint', 'Notepad', 'Excel only'], correctAnswer: 'Figma', points: 10, rubric: 'Tool familiarity' }
    ]
  },
  webDeveloper: {
    title: 'Web Development Assessment',
    questions: [
      { question: 'Which React hook manages component state?', type: 'theoretical', options: ['useState()', 'useFetch()', 'useDOM()', 'useRender()'], correctAnswer: 'useState()', points: 10, rubric: 'React fundamentals' },
      { question: 'What does REST API stand for in practice?', type: 'theoretical', options: ['Representational State Transfer', 'Remote Server Transfer', 'Rapid Endpoint System', 'None'], correctAnswer: 'Representational State Transfer', points: 5, rubric: 'API knowledge' },
      { question: 'How do you secure an API endpoint with JWT?', type: 'scenario', options: [], correctAnswer: 'Verify token in middleware, allow only authenticated requests', points: 15, rubric: 'Authentication implementation' },
      { question: 'Which method fetches data in a Node.js app?', type: 'theoretical', options: ['GET request via fetch/axios', 'INSERT command', 'SELECT only in SQL', 'setTimeout'], correctAnswer: 'GET request via fetch/axios', points: 5, rubric: 'Backend basics' },
      { question: 'A page loads slowly. What do you check first?', type: 'scenario', options: [], correctAnswer: 'Network waterfall, image sizes, API latency', points: 15, rubric: 'Performance debugging' },
      { question: 'What does SQL injection mean and how to prevent it?', type: 'theoretical', options: ['Malicious SQL input; use parameterized queries', 'Faster queries', 'Indexing only', 'No action needed'], correctAnswer: 'Malicious SQL input; use parameterized queries', points: 15, rubric: 'Security knowledge' },
      { question: 'Which CSS approach keeps styles scoped to a component?', type: 'theoretical', options: ['CSS Modules / Tailwind', 'Global stylesheet only', 'Inline all styles', 'No styles'], correctAnswer: 'CSS Modules / Tailwind', points: 10, rubric: 'Modern CSS' },
      { question: 'What is the difference between ID and class in HTML?', type: 'theoretical', options: ['ID unique, class reusable', 'Same thing', 'Class unique', 'ID reusable only'], correctAnswer: 'ID unique, class reusable', points: 5, rubric: 'HTML fundamentals' },
      { question: 'How do you implement role-based access in an app?', type: 'scenario', options: [], correctAnswer: 'Store role in token, guard routes by role', points: 15, rubric: 'Authorization design' },
      { question: 'Which service is commonly used for hosting a React build?', type: 'theoretical', options: ['Vercel / Netlify', 'Excel Online', 'OneDrive only', 'None'], correctAnswer: 'Vercel / Netlify', points: 10, rubric: 'Deployment knowledge' }
    ]
  },
  photographer: {
    title: 'Photography Assessment',
    questions: [
      { question: 'What does ISO control in photography?', type: 'theoretical', options: ['Sensor light sensitivity', 'Lens zoom', 'Shutter sound', 'White balance only'], correctAnswer: 'Sensor light sensitivity', points: 10, rubric: 'Exposure triangle' },
      { question: 'Which setting freezes fast motion?', type: 'theoretical', options: ['Fast shutter speed', 'Low ISO always', 'Narrow aperture only', 'Auto ISO'], correctAnswer: 'Fast shutter speed', points: 10, rubric: 'Exposure knowledge' },
      { question: 'How do you shoot a portrait with a blurred background?', type: 'scenario', options: [], correctAnswer: 'Wide aperture (low f-number), subject distance', points: 15, rubric: 'Depth of field control' },
      { question: 'What is the golden hour?', type: 'theoretical', options: ['Period just after sunrise/before sunset', 'Midday', 'Full moon night', 'Noon only'], correctAnswer: 'Period just after sunrise/before sunset', points: 5, rubric: 'Lighting knowledge' },
      { question: 'Which format is best for editing raw photos?', type: 'theoretical', options: ['RAW', 'JPG small', 'BMP', 'GIF'], correctAnswer: 'RAW', points: 10, rubric: 'File format for editing' },
      { question: 'An event is indoors with low light. What do you adjust?', type: 'scenario', options: [], correctAnswer: 'Wider aperture, higher ISO, slower shutter (with care)', points: 15, rubric: 'Low-light technique' },
      { question: 'What does aperture f/1.8 mean?', type: 'theoretical', options: ['Large aperture (more light)', 'Small aperture', 'Mid size', 'No light'], correctAnswer: 'Large aperture (more light)', points: 10, rubric: 'Aperture understanding' },
      { question: 'Which lens is best for group photography indoor?', type: 'theoretical', options: ['Wide angle', '500mm telephoto', 'Macro only', 'Fisheye 360'], correctAnswer: 'Wide angle', points: 5, rubric: 'Lens selection' },
      { question: 'How do you pose a nervous client for natural results?', type: 'scenario', options: [], correctAnswer: 'Conversation, direction, candid moments', points: 15, rubric: 'Client direction' },
      { question: 'What is the rule of thirds?', type: 'theoretical', options: ['Composition guideline dividing frame into 3rds', '3 photos rule', 'Thirds of shutter', 'None'], correctAnswer: 'Composition guideline dividing frame into 3rds', points: 10, rubric: 'Composition basics' }
    ]
  },
  cleaning: {
    title: 'Cleaning Service Assessment',
    questions: [
      { question: 'Which product safely cleans granite countertops?', type: 'theoretical', options: ['pH-neutral cleaner', 'Acid cleaner', 'Bleach directly', 'Abrasive powder'], correctAnswer: 'pH-neutral cleaner', points: 10, rubric: 'Surface-safe cleaning' },
      { question: 'How do you remove stains from a ceramic tile grout?', type: 'scenario', options: [], correctAnswer: 'Use grout cleaner/scrub, rinse, seal', points: 15, rubric: 'Grout restoration' },
      { question: 'What PPE should a deep cleaner always use?', type: 'theoretical', options: ['Gloves', 'Heavy boots only', 'No PPE needed', 'Sunscreen only'], correctAnswer: 'Gloves', points: 5, rubric: 'Safety hygiene' },
      { question: 'Which cloth is used for delicate surfaces like wood?', type: 'theoretical', options: ['Microfiber cloth', 'Metal scrubber', 'Rough canvas', 'Terry only'], correctAnswer: 'Microfiber cloth', points: 5, rubric: 'Tool selection' },
      { question: 'How do you approach a heavily soiled kitchen?', type: 'scenario', options: [], correctAnswer: 'Top-down, degrease, then sanitize in sections', points: 15, rubric: 'Systematic workflow' },
      { question: 'What is the correct dilution ratio for most neutral floor cleaners?', type: 'theoretical', options: ['Follow product label instructions', 'Use undiluted always', '1:100 always', 'Any ratio'], correctAnswer: 'Follow product label instructions', points: 10, rubric: 'Product handling' },
      { question: 'Which area is most commonly missed in bathroom cleaning?', type: 'theoretical', options: ['Hidden mold/hard water on underside', 'Floor center', 'Mirror frame only', 'Doorknob lint'], correctAnswer: 'Hidden mold/hard water on underside', points: 10, rubric: 'Attention to detail' },
      { question: 'How do you prevent spreading germs between rooms?', type: 'scenario', options: [], correctAnswer: 'Segment cloths/buckets, clean high-touch surfaces, sanitize', points: 15, rubric: 'Cross-contamination prevention' },
      { question: 'Which product is safe for cleaning a computer screen?', type: 'theoretical', options: ['Microfiber + screen-safe solution', 'Bleach spray', 'Scouring pad', 'Glass cleaner with ammonia'], correctAnswer: 'Microfiber + screen-safe solution', points: 10, rubric: 'Electronics cleaning' },
      { question: 'What is the first thing to do when starting any cleaning job?', type: 'theoretical', options: ['Survey and secure the area', 'Start scrubbing randomly', 'Only dust', 'Skip safety'], correctAnswer: 'Survey and secure the area', points: 10, rubric: 'Procedural discipline' }
    ]
  }
};

const seedIfEmpty = async () => {
  const counts = await Promise.all([
    User.countDocuments(),
    Worker.countDocuments(),
    Service.countDocuments(),
  ]);
  if (counts.every((c) => c > 0)) {
    console.log('Database already seeded, skipping.');
    return false;
  }
  await seed({ clean: true });
  return true;
};

module.exports = { seed, seedIfEmpty, assessmentTemplates };

if (require.main === module) {
  seed({ clean: true });
}
