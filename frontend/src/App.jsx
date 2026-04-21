import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  LinearProgress,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import PomodoroTimer from "./components/PomodoroTimer";
import SearchFilter from "./components/SearchFilter";
import ProgressChart from "./components/ProgressChart";
import StreakTracker from "./components/StreakTracker";
import FlashcardWidget from "./components/FlashcardWidget";
import ExportPlan from "./components/ExportPlan";

const COLORS = {
  ahead: "#10B981",
  track: "#F59E0B",
  behind: "#EF4444",
  primary: "#0F766E",
  secondary: "#0EA5E9",
  bg: "linear-gradient(120deg, #f6f3ee 0%, #f8fafc 55%, #edf6f4 100%)",
  cardBg: "#FFFFFF",
};

const SUBJECTS_DB = {
  "DSA": {
    emoji: "📊",
    fullName: "Data Structures & Algorithms",
    description: "Master the fundamentals of computer science with in-depth coverage of data structures and algorithms",
    Beginner: [
      "Arrays & Strings - Indexing, searching, sorting basics",
      "Linked Lists - Singly linked list, operations",
      "Stacks & Queues - LIFO/FIFO operations",
      "Hash Tables - Hashing, collision handling",
      "Sorting Basics - Bubble, selection, insertion sort",
      "Big O Notation - Time & space complexity analysis",
    ],
    Intermediate: [
      "Binary Search Trees - BST operations, traversals",
      "Graphs & BFS/DFS - Graph representations, traversals",
      "Dynamic Programming Intro - Memoization basics",
      "Greedy Algorithms - Activity selection, fractional knapsack",
      "Backtracking - N-Queens, permutations, combinations",
      "Heaps & Priority Queues - Min/Max heap implementation",
    ],
    Advanced: [
      "Advanced DP - Longest subsequences, matrix chain multiplication",
      "Network Flow - Max flow, Ford-Fulkerson algorithm",
      "Segment Trees - Range queries, updates",
      "Tries & String Matching - KMP, Rabin-Karp algorithms",
      "NP-Complete Problems - Recognition & approximation",
      "Graph Algorithms - Dijkstra, Floyd-Warshall, Bellman-Ford",
    ]
  },
  "Python": {
    emoji: "🐍",
    fullName: "Python Programming",
    description: "Learn Python from basics to advanced OOP, web development, and data science applications",
    Beginner: [
      "Syntax & Variables - Data types, variable assignment",
      "Control Flow - if/else statements, loops (for, while)",
      "Functions & Scope - Function definition, parameters, return values",
      "Data Types - Lists, tuples, dictionaries, sets",
      "String Operations - String methods, f-strings, formatting",
      "File I/O - Reading, writing, file operations",
    ],
    Intermediate: [
      "OOP Basics - Classes, objects, inheritance, polymorphism",
      "Modules & Packages - Import system, creating modules",
      "Exception Handling - Try-except blocks, custom exceptions",
      "Decorators & Closures - Function decorators, nested functions",
      "Generators & Iterators - yield keyword, generator functions",
      "List Comprehensions - Concise list creation, nested comprehensions",
    ],
    Advanced: [
      "Async Programming - asyncio, async/await, event loops",
      "Metaclasses - Class creation, __new__, __init__",
      "Performance Optimization - Profiling, caching, optimization",
      "Testing & Debugging - unittest, pytest, debugging techniques",
      "Design Patterns - Singleton, Factory, Observer, Strategy",
      "Memory Management - Garbage collection, optimization tips",
    ]
  },
  "Web Dev": {
    emoji: "🌐",
    fullName: "Web Development",
    description: "Full-stack web development covering frontend, backend, and deployment",
    Beginner: [
      "HTML Basics - Semantic HTML, forms, accessibility",
      "CSS Styling - Flexbox, Grid, responsive design",
      "JavaScript Fundamentals - Variables, functions, DOM",
      "DOM Manipulation - querySelector, event listeners",
      "Forms & Validation - Form handling, client-side validation",
      "Responsive Design - Media queries, mobile-first approach",
    ],
    Intermediate: [
      "React Hooks - useState, useEffect, custom hooks",
      "Component Architecture - Composition, reusable components",
      "REST APIs - Fetch API, axios, error handling",
      "Routing - React Router, navigation, params",
      "CSS Frameworks - Tailwind CSS, Bootstrap integration",
      "Local Storage & Session - Browser storage APIs",
    ],
    Advanced: [
      "Performance Optimization - Code splitting, lazy loading, memoization",
      "Testing - Jest, React Testing Library, E2E testing",
      "Deployment - Vercel, Netlify, GitHub Pages, CI/CD",
      "Security - CORS, XSS prevention, CSRF tokens, authentication",
      "Advanced Patterns - HOC, Render Props, Compound Components",
      "Server-Side Rendering - Next.js, SSR concepts",
    ]
  },
  "Machine Learning": {
    emoji: "🤖",
    fullName: "Machine Learning & AI",
    description: "Comprehensive guide to machine learning, deep learning, and AI applications",
    Beginner: [
      "Python for ML - NumPy arrays, Pandas dataframes",
      "Data Preprocessing - Cleaning, handling missing values",
      "Exploratory Data Analysis - Statistics, visualization",
      "Linear Regression - Cost function, gradient descent",
      "Logistic Regression - Binary classification, probability",
      "Decision Trees - Tree construction, pruning, visualization",
    ],
    Intermediate: [
      "Random Forests - Ensemble methods, bagging, feature importance",
      "K-Means Clustering - Unsupervised learning, centroid updates",
      "Principal Component Analysis - Dimensionality reduction",
      "Support Vector Machines - Kernel methods, margin maximization",
      "Neural Networks Basics - Perceptron, backpropagation",
      "Model Evaluation - Confusion matrix, precision, recall, F1-score",
    ],
    Advanced: [
      "Deep Learning - CNNs for image recognition, RNNs for sequences",
      "Natural Language Processing - Tokenization, embeddings, BERT",
      "Computer Vision - Image classification, object detection",
      "Reinforcement Learning - Q-learning, policy gradient",
      "Transfer Learning - Pre-trained models, fine-tuning",
      "Model Deployment - TensorFlow Serving, containerization",
    ]
  },
  "JavaScript": {
    emoji: "⚡",
    fullName: "JavaScript Mastery",
    description: "Deep dive into JavaScript ES6+, async programming, and modern frameworks",
    Beginner: [
      "Variables & Scope - var, let, const, block scope",
      "Data Types & Operators - Primitives, type coercion",
      "Functions & Arrow Functions - Function declarations, arrow syntax",
      "Objects & Arrays - Object methods, array manipulation",
      "DOM & Events - Event handling, event delegation",
      "Promise Basics - Promise creation, then/catch chaining",
    ],
    Intermediate: [
      "Async/Await - Async functions, error handling with try-catch",
      "Closures & Hoisting - Variable hoisting, closure patterns",
      "Prototypes & Inheritance - Prototype chain, constructor functions",
      "Modules - ES6 import/export, module patterns",
      "Error Handling - Custom errors, error stack traces",
      "Regular Expressions - Regex patterns, exec, match, replace",
    ],
    Advanced: [
      "Advanced Closures - Module pattern, data privacy",
      "Event Loop & Microtasks - Execution context, call stack",
      "Web Workers - Multi-threading in JavaScript",
      "Memory Leaks - Detecting and preventing memory issues",
      "Design Patterns - Singleton, Observer, Module pattern",
      "Advanced Async - Race conditions, concurrent operations",
    ]
  },
  "React": {
    emoji: "⚛️",
    fullName: "React & Frontend",
    description: "Master React for building modern, scalable, and performant web applications",
    Beginner: [
      "JSX & Components - Function components, JSX syntax",
      "Props & State - Component props, useState hook",
      "Hooks (useState, useEffect) - Managing component lifecycle",
      "Conditional Rendering - if/else, ternary, logical AND",
      "Lists & Keys - Rendering lists, key prop importance",
      "Form Handling - Controlled components, input handling",
    ],
    Intermediate: [
      "Context API - Creating context, useContext hook",
      "Custom Hooks - Building reusable hooks, hook rules",
      "useReducer - Complex state management, reducer pattern",
      "Performance Optimization - useMemo, useCallback, React.memo",
      "Code Splitting - Dynamic imports, lazy loading",
      "Error Boundaries - Error handling in components",
    ],
    Advanced: [
      "Advanced Patterns - HOC, Render Props, composition",
      "Server Components - RSC concepts, async components",
      "Suspense & Lazy Loading - Code splitting, data fetching",
      "Concurrent Features - Transitions, startTransition",
      "React Testing - Component testing, hooks testing",
      "State Management - Redux, Zustand, Jotai integration",
    ]
  },
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [subject, setSubject] = useState("DSA");
  const [days, setDays] = useState(3);
  const [hours, setHours] = useState(2);
  const [level, setLevel] = useState("Beginner");
  const [plan, setPlan] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [customLevelTab, setCustomLevelTab] = useState(0);
  const [customTopics, setCustomTopics] = useState({
    Beginner: "",
    Intermediate: "",
    Advanced: ""
  });
  const [customSubjects, setCustomSubjects] = useState({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [studyHistory, setStudyHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // NEW FEATURES STATE
  const [flashcards, setFlashcards] = useState([]);
  const [streakData, setStreakData] = useState({ current_streak: 0, longest_streak: 0, last_study_date: null });
  const [planAnalytics, setPlanAnalytics] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const navigate = useNavigate();

  // Fetch Streak
  const fetchStreak = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`http://localhost:5000/api/stats/streak`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setStreakData(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStreak = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/stats/streak/update`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        await fetchStreak();
        showSnackbar('Streak updated!');
      } else {
        showSnackbar('Failed to update streak', 'error');
      }
    } catch (e) {
      console.error(e);
      showSnackbar('Failed to update streak', 'error');
    }
  };

  // Fetch Flashcards
  const fetchFlashcards = async (planId) => {
    if (!planId) {
      console.warn('⚠️ No plan ID provided to fetchFlashcards');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/flashcards/${planId}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('📇 Fetched flashcards:', data);
        // Extract the flashcards array from response
        setFlashcards(data.flashcards || []);
      } else {
        console.warn('⚠️ Failed to fetch flashcards:', res.status);
        setFlashcards([]);
      }
    } catch (e) {
      console.error('❌ Error fetching flashcards:', e);
      setFlashcards([]);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async (planId) => {
    if (!planId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/analytics/${planId}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setPlanAnalytics(await res.json());
      } else {
        setPlanAnalytics(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchPlans = async (filters) => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.level) params.set('level', filters.level);
      if (filters.min_completion !== undefined) {
        params.set('min_completion', filters.min_completion);
      }

      const res = await fetch(`http://localhost:5000/api/plans/search?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.plans || []);
        showSnackbar(`Found ${data.count || 0} plans`);
      } else {
        setSearchResults([]);
        setSearchError('Failed to search plans');
      }
    } catch (e) {
      console.error(e);
      setSearchResults([]);
      setSearchError('Failed to search plans');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddFlashcard = async (cardData) => {
    console.log('🎯 handleAddFlashcard called with:', cardData);
    console.log('📍 currentPlanId:', currentPlanId);
    
    try {
      if (!currentPlanId) {
        console.warn('⚠️ currentPlanId is empty!');
        showSnackbar('Please generate a study plan first', 'error');
        return;
      }
      
      if (!cardData.plan_id) {
        console.error('❌ No plan_id in cardData!', cardData);
        showSnackbar('Error: No plan ID in flashcard data', 'error');
        return;
      }
      
      console.log('📤 Sending POST request to /api/flashcards');
      const res = await fetch(`http://localhost:5000/api/flashcards`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}` 
        },
        body: JSON.stringify(cardData)
      });
      
      console.log('📬 Response status:', res.status);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('✅ Flashcard created:', responseData);
        showSnackbar('📇 Flashcard added!');
        
        // Fetch updated flashcards
        console.log('🔄 Fetching flashcards for plan:', currentPlanId);
        fetchFlashcards(currentPlanId);
      } else {
        const errData = await res.json();
        console.error('❌ Failed with status:', res.status, 'Message:', errData);
        showSnackbar(`Error: ${errData.error || 'Failed to add flashcard'}`, 'error');
      }
    } catch (e) {
      console.error('💥 Exception in handleAddFlashcard:', e);
      showSnackbar('Failed to add flashcard: ' + e.message, 'error');
    }
  };

  const handleDeleteFlashcard = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/flashcards/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (res.ok) {
        showSnackbar('🗑️ Flashcard deleted!');
        setFlashcards(prev => prev.filter(f => f.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePomodoroComplete = async (session) => {
    if (!currentPlanId) {
      showSnackbar('Please generate a study plan first', 'error');
      return;
    }

    const token = getToken();
    const duration = session.duration || session.focus_duration || 1500;

    try {
      const pomodoroRes = await fetch(`http://localhost:5000/api/pomodoro`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          plan_id: currentPlanId,
          topic: session.topic || "General Study",
          focus_duration: duration,
          completed: true
        })
      });
      if (!pomodoroRes.ok) {
        const errData = await pomodoroRes.json();
        showSnackbar(errData.error || 'Failed to save Pomodoro session', 'error');
        return;
      }

      const sessionRes = await fetch(`http://localhost:5000/api/plans/${currentPlanId}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: session.topic || "General Study",
          duration: duration
        })
      });

      if (!sessionRes.ok) {
        console.warn('Failed to log study session for analytics');
      }

      const streakRes = await fetch(`http://localhost:5000/api/stats/streak/update`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!streakRes.ok) {
        console.warn('Failed to update streak');
      }

      showSnackbar('Pomodoro session saved!');
      fetchStreak();
      fetchAnalytics(currentPlanId);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchStreak();
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentPlanId) {
      fetchFlashcards(currentPlanId);
      fetchAnalytics(currentPlanId);
    } else {
      setFlashcards([]);
      setPlanAnalytics(null);
    }
  }, [currentPlanId]);

  // Helper functions for user-specific storage
  const getCustomSubjectsKey = (userId) => `customSubjects_${userId}`;
  const getStudyHistoryKey = (userId) => `studyHistory_${userId}`;

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      setCurrentUserId(userData.id);
      setIsAdmin(!!userData.is_admin);
      setIsAuthenticated(true);
      
      // Load user-specific custom subjects
      const customSubjectsData = localStorage.getItem(getCustomSubjectsKey(userData.id));
      if (customSubjectsData) {
        setCustomSubjects(JSON.parse(customSubjectsData));
      }
      
      // Load user-specific study history
      const historyData = localStorage.getItem(getStudyHistoryKey(userData.id));
      if (historyData) {
        setStudyHistory(JSON.parse(historyData));
      }
    }
  }, []);

  // Save custom subjects to user-specific localStorage
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(getCustomSubjectsKey(currentUserId), JSON.stringify(customSubjects));
    }
  }, [customSubjects, currentUserId]);

  // Save study history to user-specific localStorage
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(getStudyHistoryKey(currentUserId), JSON.stringify(studyHistory));
    }
  }, [studyHistory, currentUserId]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Check if user is admin (from localStorage)
  const isUserAdmin = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      console.log('⚠️ No user in localStorage');
      return false;
    }
    try {
      const userData = JSON.parse(user);
      const result = !!userData.is_admin;
      console.log('📋 isUserAdmin check - is_admin:', userData.is_admin, 'result:', result);
      return result;
    } catch {
      console.error('❌ Failed to parse user from localStorage');
      return false;
    }
  };

  const handleLoginSuccess = (userData) => {
    console.log('🔐 Login Success - userData:', userData);
    setIsAuthenticated(true);
    if (userData) {
      setCurrentUserId(userData.id);
      setIsAdmin(!!userData.is_admin);
      console.log('✅ isAdmin set to:', !!userData.is_admin);
      
      // Redirect admin users to admin dashboard
      if (userData.is_admin) {
        console.log('🚀 Redirecting to /admin');
        navigate('/admin');
      }
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUserId(null);
    setPlan([]);
    setFlashcards([]);
    setPlanAnalytics(null);
    setStreakData({ current_streak: 0, longest_streak: 0, last_study_date: null });
    setSearchResults([]);
    setStudyHistory([]);
    setCustomSubjects({});
  };

  // Show snackbar
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // Format timer
  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ===============================
  // CUSTOM SUBJECT CREATION
  // ===============================
  const handleCreateCustomSubject = () => {
    if (!customSubjectName.trim()) {
      showSnackbar('Please enter subject name', 'error');
      return;
    }

    if (!customTopics.Beginner.trim() && !customTopics.Intermediate.trim() && !customTopics.Advanced.trim()) {
      showSnackbar('Please add at least one topic', 'error');
      return;
    }

    const parseTopics = (text) => text.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    const newSubject = {
      emoji: "🎯",
      fullName: customSubjectName,
      description: `Custom learning path for ${customSubjectName}`,
      Beginner: parseTopics(customTopics.Beginner),
      Intermediate: parseTopics(customTopics.Intermediate),
      Advanced: parseTopics(customTopics.Advanced),
    };

    setCustomSubjects({
      ...customSubjects,
      [customSubjectName]: newSubject
    });

    setSubject(customSubjectName);
    setShowCustomDialog(false);
    setCustomSubjectName("");
    setCustomTopics({ Beginner: "", Intermediate: "", Advanced: "" });
    setCustomLevelTab(0);
    showSnackbar(`✨ Custom subject "${customSubjectName}" created!`);
  };

  const allSubjects = { ...SUBJECTS_DB, ...customSubjects };

  // ===============================
  // GENERATE PLAN - FIXED
  // ===============================
  const generatePlan = async () => {
    try {
      // Get the selected subject data
      const selectedSubjectData = allSubjects[subject];
      if (!selectedSubjectData) {
        showSnackbar('Subject not found', 'error');
        return;
      }

      // Get topics for the selected level
      const topics = selectedSubjectData[level] || [];
      if (topics.length === 0) {
        showSnackbar('No topics available for this level', 'error');
        return;
      }

      // Create plan structure locally (don't rely on backend for formatting)
      const hoursPerTopic = hours / Math.ceil(topics.length / days);
      const topicsPerDay = Math.ceil(topics.length / days);
      
      const planData = [];
      let topicIndex = 0;

      for (let day = 1; day <= days && topicIndex < topics.length; day++) {
        const dayTopics = [];
        for (let i = 0; i < topicsPerDay && topicIndex < topics.length; i++) {
          dayTopics.push({
            name: topics[topicIndex],
            completed: false,
            hours: hoursPerTopic.toFixed(1)
          });
          topicIndex++;
        }
        
        planData.push({
          day,
          topics: dayTopics
        });
      }

      // Set plan immediately with properly formatted data
      setPlan(planData);
      
      let newPlanId = null;

      // Save to backend
      try {
        console.log('📤 Saving plan to backend...');
        const res = await fetch(`http://localhost:5000/api/generate-plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            subject, level, days, hours, plan_data: planData
          })
        });
        if (res.ok) {
          const data = await res.json();
          newPlanId = data.id;
          console.log('✅ Plan saved! Backend ID:', newPlanId);
        } else {
          showSnackbar('Failed to save plan. Please check the backend.', 'error');
          return;
        }
      } catch (e) {
        console.error("❌ Failed to save plan to backend", e);
        showSnackbar('Failed to save plan. Please check the backend.', 'error');
        return;
      }

      if (!newPlanId) {
        showSnackbar('Failed to save plan. Please check the backend.', 'error');
        return;
      }

      console.log('🎯 Final planId being set:', newPlanId);
      setCurrentPlanId(newPlanId);

      // Add to history
      const historyEntry = {
        id: newPlanId,
        subject,
        level,
        days,
        hours,
        createdAt: new Date().toLocaleDateString(),
        completionPercentage: 0,
      };
      setStudyHistory([historyEntry, ...studyHistory]);

      showSnackbar('✅ Study plan generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error generating plan', 'error');
    }
  };

  // ===============================
  // TOGGLE COMPLETION
  // ===============================
  const toggleSubtopic = async (dayIndex, subIndex) => {
    if (!currentPlanId) {
      showSnackbar('Please generate a study plan first', 'error');
      return;
    }

    const updated = [...plan];
    updated[dayIndex].topics[subIndex].completed =
      !updated[dayIndex].topics[subIndex].completed;

    try {
      const res = await fetch(`http://localhost:5000/api/plans/${currentPlanId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          day: dayIndex + 1,
          topic: updated[dayIndex].topics[subIndex].name,
          completed: updated[dayIndex].topics[subIndex].completed,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update progress');
      }

      setPlan(updated);

      const localAnalytics = buildLocalAnalytics(updated);
      setPlanAnalytics((prev) => ({
        total_sessions: prev?.total_sessions || 0,
        total_hours: prev?.total_hours || 0,
        topic_time_minutes: prev?.topic_time_minutes || {},
        ...localAnalytics,
      }));

      fetchAnalytics(currentPlanId);

      const action = updated[dayIndex].topics[subIndex].completed ? 'completed' : 'uncompleted';
      showSnackbar(`✅ Topic ${action}!`);
    } catch (error) {
      showSnackbar(error.message || 'Error updating progress', 'error');
    }
  };

  // ===============================
  // PROGRESS
  // ===============================
  const dayProgress = (day) => {
    const total = day.topics.length;
    const completed = day.topics.filter((s) => s.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  // ===============================
  // STATUS
  // ===============================
  const statusInfo = (day) => {
    const p = dayProgress(day);
    if (p < 50) return { text: "Behind", color: COLORS.behind };
    if (p < 80) return { text: "On Track", color: COLORS.track };
    return { text: "Ahead", color: COLORS.ahead };
  };

  const buildLocalAnalytics = (planData) => {
    const topic_progress = {};
    let completedCount = 0;
    let totalCount = 0;

    planData.forEach((day) => {
      (day.topics || []).forEach((topic) => {
        const name = topic.name || topic.topic || "";
        if (!name) return;

        if (!topic_progress[name]) {
          topic_progress[name] = { completed: 0, total: 0 };
        }

        topic_progress[name].total += 1;
        totalCount += 1;

        if (topic.completed) {
          topic_progress[name].completed += 1;
          completedCount += 1;
        }
      });
    });

    const completion_percentage = totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

    return {
      completion_percentage,
      topics_completed: completedCount,
      topic_progress,
    };
  };

  // ===============================
  // CHART DATA
  // ===============================
  const barData = plan.map((day) => ({
    name: `Day ${day.day}`,
    progress: dayProgress(day),
  }));

  const pieData = [
    {
      name: "Completed",
      value: plan.reduce((s, d) => s + d.topics.filter((x) => x.completed).length, 0) || 0,
    },
    {
      name: "Remaining",
      value: plan.reduce((s, d) => s + d.topics.filter((x) => !x.completed).length, 0) || 0,
    },
  ];

  const totalProgress = pieData[0].value + pieData[1].value > 0 
    ? Math.round((pieData[0].value / (pieData[0].value + pieData[1].value)) * 100)
    : 0;

  const totalTopics = plan.reduce((sum, day) => sum + (day.topics?.length || 0), 0);

  // Show auth page if not logged in
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const currentSubjectData = allSubjects[subject];

  // ===============================
  // UI
  // ===============================
  const mainView = (
    <Box sx={{ background: COLORS.bg, minHeight: "100vh" }}>
      {/* NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(11, 31, 36, 0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar sx={{ minHeight: 72, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0ea5e9, #0f766e)",
                boxShadow: "0 0 12px rgba(14, 165, 233, 0.6)",
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
                AI Study Planner
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Focused learning workspace
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label="Live"
              size="small"
              sx={{
                background: "rgba(16, 185, 129, 0.2)",
                color: "#a7f3d0",
                fontWeight: 600,
              }}
            />
            <Button
              color="inherit"
              onClick={() => setShowHistory(!showHistory)}
              sx={{ textTransform: "none", borderRadius: 99, px: 2.5 }}
            >
              History
            </Button>
            {isAdmin && (
              <Button
                color="inherit"
                onClick={() => navigate('/admin')}
                sx={{
                  textTransform: "none",
                  borderRadius: 99,
                  px: 2.5,
                  background: "rgba(14, 165, 233, 0.16)",
                }}
              >
                Admin
              </Button>
            )}
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                borderRadius: 99,
                px: 2.5,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3, px: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: "linear-gradient(120deg, rgba(15, 118, 110, 0.95), rgba(14, 165, 233, 0.92))",
              color: "#fff",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 55%), radial-gradient(circle at 90% 20%, rgba(255,255,255,0.18), transparent 45%)",
                opacity: 0.7,
              }}
            />
            <CardContent sx={{ position: "relative", zIndex: 1, py: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography variant="overline" sx={{ letterSpacing: "0.25em", opacity: 0.8 }}>
                    Your Command Center
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    Build a focused study rhythm.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 520 }}>
                    Generate adaptive plans, track momentum, and keep streaks alive across every subject.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
                    <Chip
                      label={`Plan: ${days} days`}
                      sx={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600 }}
                    />
                    <Chip
                      label={`Topics: ${totalTopics || "--"}`}
                      sx={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600 }}
                    />
                    <Chip
                      label={`Completion: ${totalProgress}%`}
                      sx={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 600 }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      background: "rgba(11, 31, 36, 0.35)",
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      boxShadow: "none",
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ opacity: 0.8, letterSpacing: "0.1em" }}>
                        Today's Focus
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                        {subject}
                      </Typography>
                      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                          Level: {level}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                          Hours/day: {hours}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                          Tools ready: Pomodoro, Flashcards, Streak
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
        {/* STUDY HISTORY PANEL */}
        {showHistory && (
          <Card sx={{ mb: 3, borderRadius: 3, background: "#F0F9FF", border: `2px solid ${COLORS.secondary}` }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  📚 Your Study History
                </Typography>
                <Button size="small" onClick={() => setShowHistory(false)}>Close</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {studyHistory.length === 0 ? (
                <Typography color="textSecondary">No study history yet. Start planning!</Typography>
              ) : (
                <List>
                  {studyHistory.map((entry) => (
                    <ListItem key={entry.id} sx={{ borderBottom: "1px solid #E2E8F0", "&:last-child": { borderBottom: "none" } }}>
                      <ListItemText
                        primary={`${allSubjects[entry.subject]?.emoji} ${entry.subject} - ${entry.level}`}
                        secondary={`📅 ${entry.createdAt} | ⏱️ ${entry.days} days × ${entry.hours}h/day`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {/* CONTROLS */}
        <Paper elevation={0} sx={{ p: 2, mb: 2, background: COLORS.cardBg, borderRadius: 3, border: `1px solid #E2E8F0` }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📋 Plan Your Study
          </Typography>

          {/* Subject Selection Card */}
          <Card sx={{ mb: 2, borderRadius: 2, background: "#F0F9FF", border: `2px solid ${COLORS.secondary}` }}>
            <CardContent>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {currentSubjectData?.emoji} {currentSubjectData?.fullName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {currentSubjectData?.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Form Controls */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '0.9rem' }}>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  sx={{ borderRadius: 2 }}
                  label="Subject"
                >
                  {Object.entries(allSubjects).map(([key, data]) => (
                    <MenuItem key={key} value={key}>
                      {data.emoji} {data.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.8}>
              <TextField
                label="Days"
                type="number"
                fullWidth
                value={days}
                onChange={(e) => setDays(Math.max(1, +e.target.value))}
                inputProps={{ min: 1, max: 365 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1.8}>
              <TextField
                label="Hours/Day"
                type="number"
                fullWidth
                value={hours}
                onChange={(e) => setHours(Math.max(0.5, +e.target.value))}
                inputProps={{ min: 0.5, step: 0.5 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '0.9rem' }}>Level</InputLabel>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  sx={{ borderRadius: 2 }}
                  label="Level"
                >
                  <MenuItem value="Beginner">🌱 Beginner</MenuItem>
                  <MenuItem value="Intermediate">📈 Intermediate</MenuItem>
                  <MenuItem value="Advanced">🚀 Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                sx={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, borderRadius: 2, fontWeight: 600, py: 1.5 }}
                onClick={generatePlan}
              >
                🚀 Generate
              </Button>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ borderColor: COLORS.primary, color: COLORS.primary, borderRadius: 2, fontWeight: 600, py: 1.5 }}
                onClick={() => setShowCustomDialog(true)}
              >
                ✨ Custom Plan
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* CUSTOM SUBJECT DIALOG */}
        <Dialog open={showCustomDialog} onClose={() => setShowCustomDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.3rem', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, color: '#fff' }}>
            ✨ Create Custom Study Plan
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Subject Name"
              placeholder="e.g., Advanced Databases, Cloud Computing"
              value={customSubjectName}
              onChange={(e) => setCustomSubjectName(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📚 Add Topics by Level
            </Typography>

            <Tabs value={customLevelTab} onChange={(e, v) => setCustomLevelTab(v)} sx={{ mb: 2, borderBottom: `2px solid ${COLORS.secondary}` }}>
              <Tab label="🌱 Beginner" sx={{ fontWeight: 600 }} />
              <Tab label="📈 Intermediate" sx={{ fontWeight: 600 }} />
              <Tab label="🚀 Advanced" sx={{ fontWeight: 600 }} />
            </Tabs>

            <Box sx={{ display: customLevelTab === 0 ? 'block' : 'none' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                💡 Add beginner-level topics (one per line)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Beginner Topics"
                placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
                value={customTopics.Beginner}
                onChange={(e) => setCustomTopics({ ...customTopics, Beginner: e.target.value })}
              />
            </Box>

            <Box sx={{ display: customLevelTab === 1 ? 'block' : 'none' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                💡 Add intermediate-level topics (one per line)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Intermediate Topics"
                placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
                value={customTopics.Intermediate}
                onChange={(e) => setCustomTopics({ ...customTopics, Intermediate: e.target.value })}
              />
            </Box>

            <Box sx={{ display: customLevelTab === 2 ? 'block' : 'none' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                💡 Add advanced-level topics (one per line)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Advanced Topics"
                placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
                value={customTopics.Advanced}
                onChange={(e) => setCustomTopics({ ...customTopics, Advanced: e.target.value })}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              📌 Tip: Topics will appear exactly as you type them in your study plan!
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => { setShowCustomDialog(false); setCustomTopics({ Beginner: "", Intermediate: "", Advanced: "" }); setCustomLevelTab(0); }}>Cancel</Button>
            <Button variant="contained" sx={{ background: COLORS.primary }} onClick={handleCreateCustomSubject}>
              Create Custom Plan
            </Button>
          </DialogActions>
        </Dialog>

        <Divider sx={{ my: 4 }} />

        {plan.length > 0 && (
          <Box sx={{ animation: "fadeIn 0.5s ease-in-out" }}>
            {/* TOP ACTIONS: Search and Export */}
            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
              <Grid item xs={12} md={9}>
                <SearchFilter 
                  onSearch={handleSearchPlans}
                />
                {(searchLoading || searchError || searchResults.length > 0) && (
                  <Card sx={{ mt: 2, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Search Results
                      </Typography>
                      {searchLoading && (
                        <Typography variant="body2" color="textSecondary">
                          Searching plans...
                        </Typography>
                      )}
                      {searchError && !searchLoading && (
                        <Typography variant="body2" color="error">
                          {searchError}
                        </Typography>
                      )}
                      {!searchLoading && !searchError && searchResults.length === 0 && (
                        <Typography variant="body2" color="textSecondary">
                          No plans found for the selected filters.
                        </Typography>
                      )}
                      {!searchLoading && !searchError && searchResults.length > 0 && (
                        <List sx={{ p: 0 }}>
                          {searchResults.map((result) => (
                            <ListItem key={result.id} sx={{ px: 0, borderBottom: '1px solid #E2E8F0', '&:last-child': { borderBottom: 'none' } }}>
                              <ListItemText
                                primary={`${result.subject} - ${result.level}`}
                                secondary={`Days: ${result.days} | Completion: ${Math.round(result.completion_percentage || 0)}%`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid item xs={12} md={3}>
                <ExportPlan 
                  plan={{ subject, level, days, hours_per_day: hours, completion_percentage: totalProgress, created_at: new Date().toISOString() }}
                  analytics={{
                    completion_percentage: totalProgress,
                    total_sessions: 5,
                    total_hours: 10.5,
                  }}
                  onExport={(format) => {
                    showSnackbar(`✅ Plan exported as ${format.toUpperCase()}!`);
                  }}
                />
              </Grid>
            </Grid>

            {/* ACTIVE STUDY SECTION: Pomodoro, Flashcards, Streak */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: COLORS.primary, mt: 2 }}>
              🔥 Active Study Tools
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3, alignItems: "stretch" }}>
              <Grid item xs={12} md={4}>
                <PomodoroTimer 
                  planId={currentPlanId}
                  topic={subject}
                  onSessionComplete={handlePomodoroComplete}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StreakTracker 
                  streak={streakData}
                  onUpdateStreak={updateStreak}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FlashcardWidget 
                  planId={currentPlanId}
                  flashcards={flashcards}
                  onAddFlashcard={handleAddFlashcard}
                  onDeleteFlashcard={handleDeleteFlashcard}
                />
              </Grid>
            </Grid>

            {/* ANALYTICS SECTION */}
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: COLORS.primary, mt: 2 }}>
              📈 Course Analytics & Progress
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <ProgressChart
                  analytics={planAnalytics || {
                    completion_percentage: totalProgress,
                    total_sessions: 0,
                    total_hours: 0,
                    topics_completed: pieData[0].value,
                    topic_progress: {}
                  }}
                />
              </Grid>
            </Grid>

<Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* DAY CARDS - ENHANCED */}
        {plan.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.primary }}>
              📅 Your Study Plan ({days} Days)
            </Typography>
            <Grid container spacing={2}>
              {plan.map((day, i) => {
                const status = statusInfo(day);
                return (
                  <Grid item xs={12} key={i}>
                    <Accordion defaultExpanded={i === 0} sx={{ borderRadius: 2, border: `2px solid ${status.color}20` }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: "#F9FAFB", py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, minWidth: 80 }}>
                            Day {day.day}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress variant="determinate" value={dayProgress(day)} sx={{ height: 8, borderRadius: 4, background: "#E2E8F0", "& .MuiLinearProgress-bar": { background: status.color } }} />
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: status.color }}>
                              {dayProgress(day)}%
                            </Typography>
                            <Chip label={status.text} size="small" sx={{ background: status.color, color: "#fff" }} />
                          </Box>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ pt: 3, background: "#FAFBFC" }}>
                        {day.topics && day.topics.length > 0 ? (
                          <>
                            <List sx={{ p: 0 }}>
                              {day.topics.map((topic, j) => (
                                <ListItem key={j} sx={{ py: 1.5, borderBottom: "1px solid #E2E8F0", "&:last-child": { borderBottom: "none" }, transition: "all 0.2s", cursor: "pointer", "&:hover": { background: "#F0F9FF" } }} onClick={() => toggleSubtopic(i, j)}>
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    {topic.completed ? (
                                      <CheckCircleIcon sx={{ color: COLORS.ahead, fontSize: 24 }} />
                                    ) : (
                                      <RadioButtonUncheckedIcon sx={{ color: "#CBD5E1", fontSize: 24 }} />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography sx={{ fontWeight: 600, textDecoration: topic.completed ? "line-through" : "none", color: topic.completed ? "#94A3B8" : "#1E293B" }}>
                                        {topic.name}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="caption" sx={{ color: "#64748B" }}>
                                        ⏱️ {topic.hours}h • Click to mark complete
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                            <Box sx={{ mt: 2, pt: 2, borderTop: "2px solid #E2E8F0" }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748B" }}>
                                ✅ {day.topics.filter(t => t.completed).length} of {day.topics.length} completed
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <Typography color="textSecondary">No topics for this day</Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {plan.length === 0 && (
          <Paper elevation={0} sx={{ p: 8, textAlign: "center", borderRadius: 3, border: "2px dashed #CBD5E1" }}>
            <Typography variant="h5" sx={{ color: "#64748B", fontWeight: 600, mb: 1 }}>
              📚 No Plan Generated Yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Choose a subject and click "Generate Plan" to start learning!
            </Typography>
          </Paper>
        )}
      </Container>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.type} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );

  return (
    <Routes>
      <Route path="/" element={mainView} />
      <Route
        path="/admin"
        element={
          isUserAdmin() && isAuthenticated ? (
            <AdminDashboard
              token={getToken()}
              onLogout={handleLogout}
              onBack={() => navigate('/')}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
