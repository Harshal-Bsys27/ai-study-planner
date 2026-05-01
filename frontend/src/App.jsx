import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
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
  IconButton,
  Avatar,
  Menu,
  Badge,
  InputAdornment,
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
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import PomodoroTimer from "./components/PomodoroTimer";
import SearchFilter from "./components/SearchFilter";
import ProgressChart from "./components/ProgressChart";
import StreakTracker from "./components/StreakTracker";
import FlashcardWidget from "./components/FlashcardWidget";
import ExportPlan from "./components/ExportPlan";
import { ThemeModeContext } from "./theme";

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = {
  ahead: "#10B981",
  track: "#F59E0B",
  behind: "#EF4444",
  primary: "#0F766E",
  secondary: "#0EA5E9",
  bg: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 30%, #99f6e4 70%, #5eead4 100%)",
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
  const [studyHistory, setStudyHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // NEW FEATURES STATE
  const [flashcards, setFlashcards] = useState([]);
  const [streakData, setStreakData] = useState({ current_streak: 0, longest_streak: 0, last_study_date: null });
  const [planAnalytics, setPlanAnalytics] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationIdRef = useRef(0);

  const navigate = useNavigate();
  const { mode, toggleMode } = useContext(ThemeModeContext);
  const isDarkMode = mode === "dark";

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch Streak
  const fetchStreak = useCallback(async () => {
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
  }, [isAuthenticated]);

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
  const fetchFlashcards = useCallback(async (planId) => {
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
  }, []);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async (planId) => {
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
  }, []);

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
  }, [isAuthenticated, fetchStreak]);

  useEffect(() => {
    if (currentPlanId) {
      fetchFlashcards(currentPlanId);
      fetchAnalytics(currentPlanId);
    } else {
      setFlashcards([]);
      setPlanAnalytics(null);
    }
  }, [currentPlanId, fetchFlashcards, fetchAnalytics]);

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

  const notificationColors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#06b6d4",
  };

  const addNotification = (message, type = "info") => {
    notificationIdRef.current += 1;
    const entry = {
      id: `notice-${notificationIdRef.current}`,
      message,
      type,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setNotifications((prev) => [entry, ...prev].slice(0, 6));
  };

  const handleOpenNotifications = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchorEl(null);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Show snackbar
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
    addNotification(message, type);
  };

  // Note: formatTimer function removed - not currently used in the component

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
      const res = await fetch(`${API_URL}/api/plans/${currentPlanId}/progress`, {
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

      try {
        const localAnalytics = buildLocalAnalytics(updated);
        setPlanAnalytics((prev) => ({
          total_sessions: prev?.total_sessions || 0,
          total_hours: prev?.total_hours || 0,
          topic_time_minutes: prev?.topic_time_minutes || {},
          ...localAnalytics,
        }));
      } catch (error) {
        console.error('Error updating analytics:', error);
        // Keep previous analytics if update fails
      }

      // Don't fetch analytics from server to avoid overwriting local updates
      // The local analytics are sufficient for real-time updates

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
  // Note: barData removed - not currently used, pieData is the active chart
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
    <Box sx={{ 
      background: isDarkMode 
        ? "linear-gradient(135deg, #030a06 0%, #051c12 50%, #0a2818 100%)" 
        : COLORS.bg, 
      minHeight: "100vh" 
    }}>
      {/* MODERN NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        className="navbar-glow"
        sx={{
          background: isDarkMode
            ? "linear-gradient(135deg, #051c12 0%, #072a18 50%, #0a3820 100%)"
            : "linear-gradient(135deg, #011a11 0%, #052e1c 50%, #053a23 100%)",
          backdropFilter: "blur(28px)",
          borderBottom: isDarkMode 
            ? "1px solid rgba(34, 197, 94, 0.2)" 
            : "1px solid rgba(52, 211, 153, 0.12)",
          height: 72,
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 }, gap: 2 }}>
          {/* Logo Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                background: "linear-gradient(145deg, #34d399 0%, #10b981 50%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(52, 211, 153, 0.45), 0 4px 12px rgba(0,0,0,0.3)",
                flexShrink: 0,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.08) rotate(-3deg)",
                  boxShadow: "0 0 30px rgba(52, 211, 153, 0.6), 0 6px 20px rgba(0,0,0,0.4)",
                }
              }}
            >
              <DashboardIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="h6"
                className="shimmer-text"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                AI Study Planner
              </Typography>
              <Typography
                sx={{
                  color: "rgba(52, 211, 153, 0.8)",
                  fontWeight: 600,
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Focused Learning
              </Typography>
            </Box>
          </Box>

          {/* Search Bar - Desktop */}
          <Box sx={{
            flexGrow: 1,
            mx: { xs: 0, md: 5 },
            display: { xs: "none", md: "flex" },
            justifyContent: "center",
          }}>
            <TextField
              placeholder="Search plans, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{
                maxWidth: 440,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.07)",
                  color: "#e2e8f0",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                  },
                  "&.Mui-focused": {
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(52, 211, 153, 0.6)",
                    boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.1)",
                  },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.88rem"
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(52, 211, 153, 0.7)", fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
            {/* Live Status */}
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1,
              background: "rgba(52, 211, 153, 0.12)", borderRadius: "20px", px: 1.5, py: 0.5,
              border: "1px solid rgba(52, 211, 153, 0.2)"
            }}>
              <Box className="admin-live-dot" />
              <Typography sx={{ color: "#6ee7b7", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                LIVE
              </Typography>
            </Box>

            {/* Navigation Icons - Desktop */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
              <IconButton
                onClick={() => setShowHistory(!showHistory)}
                title="Study History"
                sx={{
                  color: showHistory ? "#34d399" : "rgba(255,255,255,0.65)",
                  background: showHistory ? "rgba(52, 211, 153, 0.15)" : "transparent",
                  borderRadius: "10px", width: 40, height: 40,
                  transition: "all 0.2s ease",
                  "&:hover": { color: "#34d399", background: "rgba(52, 211, 153, 0.15)" }
                }}
              >
                <HistoryIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <IconButton
                onClick={toggleMode}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                sx={{
                  color: "rgba(255,255,255,0.65)", borderRadius: "10px", width: 40, height: 40,
                  transition: "all 0.2s ease",
                  "&:hover": { color: "#60a5fa", background: "rgba(96, 165, 250, 0.12)" }
                }}
              >
                {isDarkMode ? (
                  <LightModeIcon sx={{ fontSize: 20 }} />
                ) : (
                  <DarkModeIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>

              <IconButton
                onClick={handleOpenNotifications}
                title="Notifications"
                sx={{
                  color: "rgba(255,255,255,0.65)", borderRadius: "10px", width: 40, height: 40,
                  transition: "all 0.2s ease",
                  "&:hover": { color: "#fbbf24", background: "rgba(251, 191, 36, 0.1)" }
                }}
              >
                <Badge badgeContent={notifications.length} color="error"
                  sx={{ "& .MuiBadge-badge": { fontSize: 9, height: 16, minWidth: 16, top: 2, right: 2 } }}
                >
                  <NotificationsIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>

              {isAdmin && (
                <IconButton
                  onClick={() => navigate('/admin')}
                  title="Admin Panel"
                  sx={{
                    color: "rgba(255,255,255,0.65)", borderRadius: "10px", width: 40, height: 40,
                    transition: "all 0.2s ease",
                    "&:hover": { color: "#34d399", background: "rgba(52, 211, 153, 0.15)" }
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>

            {/* Divider */}
            <Box sx={{ display: { xs: "none", md: "block" }, width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />

            {/* User Profile */}
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0.5, transition: "all 0.25s ease", "&:hover": { transform: "scale(1.05)" } }}
            >
              <Avatar
                sx={{
                  width: 38, height: 38,
                  background: "linear-gradient(135deg, #34d399 0%, #0f766e 100%)",
                  border: "2px solid rgba(52, 211, 153, 0.4)",
                  boxShadow: "0 4px 16px rgba(52, 211, 153, 0.3)",
                  fontSize: "0.85rem", fontWeight: 800, fontFamily: '"Outfit", sans-serif'
                }}
              >
                <PersonIcon sx={{ fontSize: 20 }} />
              </Avatar>
            </IconButton>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{
                display: { xs: "flex", md: "none" },
                color: "rgba(255,255,255,0.8)", borderRadius: "10px",
                transition: "all 0.2s ease",
                "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" }
              }}
            >
              <MenuIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Mobile Menu */}
        <Box
          sx={{
            display: { xs: mobileMenuOpen ? "flex" : "none", md: "none" },
            flexDirection: "column",
            background: "rgba(1, 26, 17, 0.98)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(52, 211, 153, 0.15)",
            px: 2, py: 2, gap: 0.5
          }}
        >
          <TextField
            placeholder="Search plans, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                background: "rgba(255,255,255,0.07)",
                color: "#e2e8f0", fontWeight: 500,
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                border: "1px solid rgba(255,255,255,0.1)",
              },
              "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.4)" }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(52, 211, 153, 0.7)", fontSize: 18 }} />
                </InputAdornment>
              )
            }}
          />
          {[{
            label: "Study History", icon: <HistoryIcon />, action: () => { setShowHistory(!showHistory); setMobileMenuOpen(false); },
            color: "#34d399"
          }, {
            label: isDarkMode ? "Light Mode" : "Dark Mode",
            icon: isDarkMode ? <LightModeIcon /> : <DarkModeIcon />,
            action: () => { toggleMode(); setMobileMenuOpen(false); },
            color: "#60a5fa"
          }, ...(isAdmin ? [{ label: "Admin Panel", icon: <SettingsIcon />, action: () => { navigate('/admin'); setMobileMenuOpen(false); }, color: "#fbbf24" }] : []),
          { label: "Logout", icon: <LogoutIcon />, action: () => { handleLogout(); setMobileMenuOpen(false); }, color: "#f87171" }
          ].map((item) => (
            <Button
              key={item.label}
              onClick={item.action}
              startIcon={React.cloneElement(item.icon, { sx: { fontSize: 18, color: item.color } })}
              sx={{
                justifyContent: "flex-start", color: "rgba(255,255,255,0.85)",
                borderRadius: "10px", py: 1.4, px: 2, fontWeight: 600, fontSize: "0.9rem",
                transition: "all 0.2s ease",
                "&:hover": { background: `${item.color}18`, color: item.color, pl: 2.5 }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleCloseNotifications}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 320,
            borderRadius: "16px",
            background: isDarkMode 
              ? "rgba(15, 25, 20, 0.95)" 
              : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(24px)",
            boxShadow: isDarkMode
              ? "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(34,197,94,0.1)"
              : "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(15,118,110,0.1)",
            border: isDarkMode 
              ? "1px solid rgba(34, 197, 94, 0.15)" 
              : "1px solid rgba(15, 118, 110, 0.1)",
            overflow: "hidden",
          }
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2.5, py: 2, background: isDarkMode ? "linear-gradient(135deg, #0a1f1a 0%, #142d25 100%)" : "linear-gradient(135deg, #022c22 0%, #064e3b 100%)", color: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                onClick={clearNotifications}
                sx={{ color: "#6ee7b7", fontWeight: 700, textTransform: "none" }}
              >
                Clear
              </Button>
            )}
          </Box>
          <Typography variant="caption" sx={{ color: "rgba(52, 211, 153, 0.8)", fontWeight: 600 }}>
            {notifications.length > 0 ? `${notifications.length} unread` : "All caught up"}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

        {notifications.length === 0 ? (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="body2" sx={{ color: isDarkMode ? "#94a3b8" : "#64748B", fontWeight: 500 }}>
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          notifications.map((note) => {
            const tone = notificationColors[note.type] || notificationColors.info;

            return (
              <MenuItem
                key={note.id}
                onClick={handleCloseNotifications}
                sx={{ py: 1.2, px: 2.5, gap: 1.4, transition: "all 0.2s ease",
                  "&:hover": { background: `${tone}10`, pl: 2.8 }
                }}
              >
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: tone, boxShadow: `0 0 8px ${tone}80` }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 700, color: isDarkMode ? "#e2e8f0" : "#0f172a", lineHeight: 1.3 }}>
                      {note.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: isDarkMode ? "#6b7280" : "#94a3b8", fontWeight: 600 }}>
                      {note.createdAt}
                    </Typography>
                  }
                />
              </MenuItem>
            );
          })
        )}
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 240,
            borderRadius: "16px",
            background: isDarkMode 
              ? "rgba(15, 25, 20, 0.95)" 
              : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(24px)",
            boxShadow: isDarkMode
              ? "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(34,197,94,0.1)"
              : "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(15,118,110,0.1)",
            border: isDarkMode 
              ? "1px solid rgba(34, 197, 94, 0.15)" 
              : "1px solid rgba(15, 118, 110, 0.1)",
            overflow: "hidden",
          }
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2.5, py: 2, background: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 38, height: 38, background: "linear-gradient(135deg, #34d399, #059669)", fontSize: "0.9rem", fontWeight: 800 }}>
              <PersonIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                {(() => { try { return JSON.parse(localStorage.getItem('user'))?.username || "User"; } catch { return "User"; } })()}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(52, 211, 153, 0.8)", fontWeight: 500 }}>
                {isAdmin ? "✦ Administrator" : "Student"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {[
          { icon: <PersonIcon />, label: "View Profile", sub: "Account settings", color: "#0f766e", action: () => setAnchorEl(null) },
          { icon: <HistoryIcon />, label: "Study History", sub: "Past sessions", color: "#0891b2", action: () => { setAnchorEl(null); setShowHistory(!showHistory); } },
          ...(isAdmin ? [{ icon: <SettingsIcon />, label: "Admin Panel", sub: "Manage platform", color: "#d97706", action: () => { setAnchorEl(null); navigate('/admin'); } }] : []),
        ].map((item) => (
          <MenuItem
            key={item.label}
            onClick={item.action}
            sx={{ py: 1.3, px: 2.5, gap: 1.8, transition: "all 0.2s ease",
              "&:hover": { background: `${item.color}10`, pl: 2.8 }
            }}
          >
            {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 20 } })}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{item.label}</Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 500 }}>{item.sub}</Typography>
            </Box>
          </MenuItem>
        ))}

        <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />
        <MenuItem
          onClick={() => { setAnchorEl(null); handleLogout(); }}
          sx={{ py: 1.3, px: 2.5, gap: 1.8, mb: 0.5, borderRadius: "0 0 16px 16px", transition: "all 0.2s ease",
            "&:hover": { background: "rgba(239, 68, 68, 0.07)", pl: 2.8 }
          }}
        >
          <LogoutIcon sx={{ color: "#ef4444", fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#ef4444" }}>Sign Out</Typography>
        </MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ py: 3, px: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Card
            className="fade-in"
            sx={{
              borderRadius: "22px",
              overflow: "hidden",
              background: "linear-gradient(135deg, #022c22 0%, #064e3b 35%, #0d6b57 70%, #0891b2 100%)",
              color: "#fff",
              position: "relative",
              boxShadow: "0 20px 60px rgba(2, 44, 34, 0.45), 0 0 80px rgba(16, 185, 129, 0.06)",
              border: "1px solid rgba(52, 211, 153, 0.15)",
            }}
          >
            {/* Ambient orbs */}
            <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
              <Box sx={{ position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(52, 211, 153, 0.18), transparent 70%)", animation: "float 8s ease-in-out infinite" }} />
              <Box sx={{ position: "absolute", bottom: -60, left: "30%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%)", animation: "float 10s ease-in-out infinite 2s" }} />
            </Box>

            <CardContent sx={{ position: "relative", zIndex: 1, py: { xs: 3.5, md: 5 }, px: { xs: 3, md: 4 } }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography
                    sx={{
                      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.25em",
                      textTransform: "uppercase", color: "rgba(52, 211, 153, 0.9)", mb: 1.5
                    }}
                  >
                    ✦ Your Command Center
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800, mb: 1.5,
                      fontSize: { xs: "1.75rem", md: "2.3rem" },
                      lineHeight: 1.15,
                      color: "#fff",
                    }}
                  >
                    Build a focused<br />study rhythm.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 480, fontSize: "0.95rem", lineHeight: 1.7, mb: 3 }}
                  >
                    Generate adaptive plans, track momentum, and keep streaks alive across every subject.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {[
                      { label: `📅 ${days} days`, bg: "rgba(52, 211, 153, 0.15)", border: "rgba(52, 211, 153, 0.3)" },
                      { label: `📚 ${totalTopics || "--"} topics`, bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.3)" },
                      { label: `🎯 ${totalProgress}%`, bg: "rgba(251, 191, 36, 0.15)", border: "rgba(251, 191, 36, 0.3)" },
                    ].map((chip) => (
                      <Chip
                        key={chip.label}
                        label={chip.label}
                        size="small"
                        sx={{
                          background: chip.bg, color: "#fff", fontWeight: 700,
                          border: `1px solid ${chip.border}`, borderRadius: "8px",
                          fontSize: "0.8rem", height: 32,
                          transition: "all 0.2s ease",
                          "&:hover": { transform: "translateY(-1px)", filter: "brightness(1.15)" }
                        }}
                      />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(52, 211, 153, 0.8)", mb: 1.5 }}>
                        Today's Focus
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, fontSize: "1.4rem", color: "#fff", mb: 2 }}>
                        {subject}
                      </Typography>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 2 }} />
                      <Stack spacing={1.5}>
                        {[
                          { dot: "#34d399", text: `Level: ${level}` },
                          { dot: "#22d3ee", text: `Hours/day: ${hours}` },
                          { dot: "#fbbf24", text: "Tools: Pomodoro, Cards, Streak" },
                        ].map((item) => (
                          <Box key={item.text} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: item.dot, boxShadow: `0 0 8px ${item.dot}60` }} />
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 500, fontSize: "0.85rem" }}>
                              {item.text}
                            </Typography>
                          </Box>
                        ))}
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
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: 3, 
              background: isDarkMode 
                ? "linear-gradient(135deg, rgba(10, 40, 24, 0.8), rgba(15, 50, 30, 0.8))" 
                : "linear-gradient(135deg, rgba(240, 249, 255, 0.95), rgba(224, 242, 254, 0.9))", 
              border: `2px solid ${COLORS.secondary}`,
              boxShadow: isDarkMode
                ? "0 8px 24px rgba(34, 197, 94, 0.1)"
                : "0 8px 24px rgba(14, 165, 233, 0.15)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: isDarkMode
                  ? "0 12px 32px rgba(34, 197, 94, 0.15)"
                  : "0 12px 32px rgba(14, 165, 233, 0.2)",
                transform: "translateY(-2px)"
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? "#6ee7b7" : COLORS.primary }}>
                  📚 Your Study History
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => setShowHistory(false)}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600
                  }}
                >
                  Close
                </Button>
              </Box>
              <Divider sx={{ mb: 2, borderColor: isDarkMode ? "rgba(34, 197, 94, 0.3)" : "rgba(14, 165, 233, 0.3)" }} />
              {studyHistory.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography color="textSecondary" sx={{ fontSize: "0.95rem" }}>
                    No study history yet. Start planning!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {studyHistory.map((entry) => (
                    <ListItem 
                      key={entry.id} 
                      sx={{ 
                        borderBottom: isDarkMode ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(14, 165, 233, 0.2)", 
                        "&:last-child": { borderBottom: "none" },
                        transition: "all 0.2s ease",
                        "&:hover": {
                          background: isDarkMode ? "rgba(34, 197, 94, 0.08)" : "rgba(14, 165, 233, 0.08)",
                          borderRadius: 2
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, color: isDarkMode ? "#6ee7b7" : "#0f766e" }}>
                            {allSubjects[entry.subject]?.emoji} {entry.subject} - {entry.level}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: "#64748B", mt: 0.5 }}>
                            📅 {entry.createdAt} | ⏱️ {entry.days} days × {entry.hours}h/day
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        )}

        {/* CONTROLS */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))", 
            borderRadius: 3, 
            border: `1px solid rgba(14, 165, 233, 0.15)`,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 28px rgba(0, 0, 0, 0.08)",
              borderColor: "rgba(14, 165, 233, 0.25)"
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: COLORS.primary }}>
            📋 Plan Your Study
          </Typography>

          {/* Subject Selection Card */}
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: 2.5, 
              background: isDarkMode 
                ? "linear-gradient(135deg, rgba(10, 40, 24, 0.8), rgba(15, 50, 30, 0.8))" 
                : "linear-gradient(135deg, rgba(240, 249, 255, 0.9), rgba(224, 242, 254, 0.85))", 
              border: `2px solid ${COLORS.secondary}`,
              boxShadow: isDarkMode 
                ? "0 4px 16px rgba(34, 197, 94, 0.1)" 
                : "0 4px 16px rgba(14, 165, 233, 0.12)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: isDarkMode 
                  ? "0 6px 24px rgba(34, 197, 94, 0.15)" 
                  : "0 6px 24px rgba(14, 165, 233, 0.18)",
                transform: "translateY(-2px)"
              }
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: isDarkMode ? "#6ee7b7" : "#0f766e" }}>
                  {currentSubjectData?.emoji} {currentSubjectData?.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? "#cbd5e1" : "#64748B", lineHeight: 1.5 }}>
                  {currentSubjectData?.description}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Form Controls */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  sx={{ 
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: COLORS.secondary
                      }
                    }
                  }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: COLORS.secondary
                    }
                  }
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: COLORS.secondary
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Level</InputLabel>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  sx={{ 
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: COLORS.secondary
                      }
                    }
                  }}
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
                sx={{ 
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, 
                  borderRadius: 2, 
                  fontWeight: 600, 
                  py: 1.5,
                  boxShadow: "0 4px 14px rgba(15, 118, 110, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(15, 118, 110, 0.4)",
                    transform: "translateY(-2px)"
                  }
                }}
                onClick={generatePlan}
              >
                🚀 Generate
              </Button>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  borderColor: COLORS.primary, 
                  color: COLORS.primary, 
                  borderRadius: 2, 
                  fontWeight: 600, 
                  py: 1.5,
                  borderWidth: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(15, 118, 110, 0.05)",
                    borderWidth: 2,
                    transform: "translateY(-2px)"
                  }
                }}
                onClick={() => setShowCustomDialog(true)}
              >
                ✨ Custom Plan
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* CUSTOM SUBJECT DIALOG */}
        <Dialog 
          open={showCustomDialog} 
          onClose={() => setShowCustomDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))",
              backdropFilter: "blur(20px)"
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              fontWeight: 700, 
              fontSize: '1.4rem', 
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, 
              color: '#fff',
              py: 3,
              borderBottom: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            ✨ Create Custom Study Plan
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Subject Name"
              placeholder="e.g., Advanced Databases, Cloud Computing"
              value={customSubjectName}
              onChange={(e) => setCustomSubjectName(e.target.value)}
              sx={{ 
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: COLORS.secondary
                  }
                }
              }}
            />

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: COLORS.primary }}>
              📚 Add Topics by Level
            </Typography>

            <Tabs 
              value={customLevelTab} 
              onChange={(e, v) => setCustomLevelTab(v)} 
              sx={{ 
                mb: 3, 
                borderBottom: `2px solid ${COLORS.secondary}40`,
                "& .MuiTab-root": {
                  fontWeight: 600,
                  textTransform: "none"
                }
              }}
            >
              <Tab label="🌱 Beginner" />
              <Tab label="📈 Intermediate" />
              <Tab label="🚀 Advanced" />
            </Tabs>

            <Box sx={{ display: customLevelTab === 0 ? 'block' : 'none' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: COLORS.secondary
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ display: customLevelTab === 1 ? 'block' : 'none' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: COLORS.secondary
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ display: customLevelTab === 2 ? 'block' : 'none' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: COLORS.secondary
                    }
                  }
                }}
              />
            </Box>

            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                borderRadius: 2,
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(15, 118, 110, 0.1))",
                border: "1px solid rgba(14, 165, 233, 0.3)"
              }}
            >
              📌 Tip: Topics will appear exactly as you type them in your study plan!
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1.5 }}>
            <Button 
              onClick={() => { setShowCustomDialog(false); setCustomTopics({ Beginner: "", Intermediate: "", Advanced: "" }); setCustomLevelTab(0); }}
              sx={{ 
                borderRadius: 2,
                fontWeight: 600,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              sx={{ 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                boxShadow: "0 4px 14px rgba(15, 118, 110, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(15, 118, 110, 0.4)",
                  transform: "translateY(-2px)"
                }
              }} 
              onClick={handleCreateCustomSubject}
            >
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
            <Box sx={{ 
              background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
              borderRadius: 3,
              p: 3,
              mb: 4,
              border: "1px solid #047857"
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "#34d399", mt: 0, fontSize: "1.4rem" }}>
                🔥 Active Study Tools
              </Typography>
              <Grid container spacing={2.5} sx={{ alignItems: "stretch" }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)"
                    }
                  }}>
                    <PomodoroTimer 
                      planId={currentPlanId}
                      topic={subject}
                      onSessionComplete={handlePomodoroComplete}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)"
                    }
                  }}>
                    <StreakTracker 
                      streak={streakData}
                      onUpdateStreak={updateStreak}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ 
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)"
                    }
                  }}>
                    <FlashcardWidget 
                      planId={currentPlanId}
                      flashcards={flashcards}
                      onAddFlashcard={handleAddFlashcard}
                      onDeleteFlashcard={handleDeleteFlashcard}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* ANALYTICS SECTION */}
            <Box sx={{ 
              background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
              borderRadius: 3,
              p: 3,
              mb: 4,
              border: "1px solid #0d9488"
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "#5eead4", mt: 0, fontSize: "1.4rem" }}>
                📈 Course Analytics & Progress
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)"
                    }
                  }}>
                    <ProgressChart
                      analytics={planAnalytics || {
                        completion_percentage: totalProgress,
                        total_sessions: 0,
                        total_hours: 0,
                        topics_completed: pieData[0].value,
                        topic_progress: {}
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

<Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* DAY CARDS - ENHANCED */}
        {plan.length > 0 && (
          <Box sx={{ 
            mt: 1,
            background: isDarkMode
              ? "linear-gradient(135deg, #0a3a45 0%, #0f4a55 100%)"
              : "linear-gradient(135deg, #0e7490 0%, #155e75 100%)",
            borderRadius: 3,
            p: 3,
            border: isDarkMode 
              ? "1px solid rgba(34, 197, 94, 0.2)" 
              : "1px solid #0891b2"
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: isDarkMode ? "#6ee7b7" : "#67e8f9", fontSize: "1.25rem" }}>
              📅 Your Study Plan ({days} Days)
            </Typography>
            <Grid container spacing={2.5}>
              {plan.map((day, i) => {
                const status = statusInfo(day);
                return (
                  <Grid item xs={12} key={i}>
                    <Accordion 
                      defaultExpanded={i === 0} 
                      sx={{ 
                        borderRadius: 2.5, 
                        border: `2px solid ${status.color}30`,
                        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          transform: "translateY(-2px)"
                        },
                        "&::before": {
                          display: "none"
                        }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ color: COLORS.primary }} />} 
                        sx={{ 
                          background: isDarkMode
                            ? "linear-gradient(135deg, #1e2d2a 0%, #1a3a35 100%)"
                            : "linear-gradient(135deg, #F9FAFB 0%, #F0F9FF 100%)", 
                          py: 2.5,
                          px: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: isDarkMode
                              ? "linear-gradient(135deg, #1a3a35 0%, #165e57 100%)"
                              : "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)"
                          }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, width: "100%" }}>
                          <Box sx={{ 
                            minWidth: 70,
                            height: 45,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(135deg, ${status.color}20, ${status.color}10)`,
                            borderRadius: 2,
                            border: `2px solid ${status.color}40`
                          }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: status.color, fontSize: "1rem" }}>
                              Day {day.day}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={dayProgress(day)} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5, 
                                background: "#E2E8F0", 
                                "& .MuiLinearProgress-bar": { 
                                  background: `linear-gradient(90deg, ${status.color}, ${status.color}CC)`,
                                  borderRadius: 5
                                } 
                              }} 
                            />
                          </Box>
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: status.color, fontSize: "0.9rem" }}>
                              {dayProgress(day)}%
                            </Typography>
                            <Chip 
                              label={status.text} 
                              size="small" 
                              sx={{ 
                                background: status.color, 
                                color: "#fff",
                                fontWeight: 600,
                                boxShadow: `0 2px 8px ${status.color}60`
                              }} 
                            />
                          </Box>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ pt: 3, background: isDarkMode ? "#0d1b18" : "#FAFBFC", px: 2 }}>
                        {day.topics && day.topics.length > 0 ? (
                          <>
                            <List sx={{ p: 0 }}>
                              {day.topics.map((topic, j) => (
                                <ListItem 
                                  key={j} 
                                  sx={{ 
                                    py: 2, 
                                    px: 2,
                                    mb: 1,
                                    borderRadius: 2,
                                    borderBottom: "none", 
                                    background: isDarkMode ? "#1a2f2c" : "#fff",
                                    border: isDarkMode ? "1px solid #374151" : "1px solid #E2E8F0",
                                    transition: "all 0.2s ease", 
                                    cursor: "pointer", 
                                    "&:hover": { 
                                      background: isDarkMode 
                                        ? "linear-gradient(135deg, #1e3e3a, #2a4a45)"
                                        : "linear-gradient(135deg, #F0F9FF, #E0F2FE)",
                                      borderColor: COLORS.secondary,
                                      transform: "translateX(4px)",
                                      boxShadow: isDarkMode 
                                        ? "0 2px 8px rgba(52, 211, 153, 0.1)"
                                        : "0 2px 8px rgba(14, 165, 233, 0.15)"
                                    }
                                  }} 
                                  onClick={() => toggleSubtopic(i, j)}
                                >
                                  <ListItemIcon sx={{ minWidth: 48 }}>
                                    {topic.completed ? (
                                      <Box sx={{ 
                                        width: 28, 
                                        height: 28, 
                                        borderRadius: "50%", 
                                        background: `linear-gradient(135deg, ${COLORS.ahead}, ${COLORS.ahead}CC)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: `0 2px 8px ${COLORS.ahead}60`
                                      }}>
                                        <CheckCircleIcon sx={{ color: "#fff", fontSize: 18 }} />
                                      </Box>
                                    ) : (
                                      <Box sx={{ 
                                        width: 28, 
                                        height: 28, 
                                        borderRadius: "50%", 
                                        background: isDarkMode ? "#374151" : "#F1F5F9",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: isDarkMode ? "2px solid #6b7280" : "2px solid #CBD5E1"
                                      }}>
                                        <RadioButtonUncheckedIcon sx={{ color: isDarkMode ? "#d1d5db" : "#94A3B8", fontSize: 18 }} />
                                      </Box>
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography sx={{ 
                                        fontWeight: 600, 
                                        textDecoration: topic.completed ? "line-through" : "none", 
                                        color: topic.completed 
                                          ? isDarkMode ? "#9ca3af" : "#94A3B8"
                                          : isDarkMode ? "#e2e8f0" : "#1E293B",
                                        fontSize: "0.95rem"
                                      }}>
                                        {topic.name}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="caption" sx={{ color: isDarkMode ? "#9ca3af" : "#64748B", mt: 0.5, fontWeight: 500 }}>
                                        ⏱️ {topic.hours}h • Click to mark complete
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                            <Box sx={{ 
                              mt: 2.5, 
                              pt: 2.5, 
                              borderTop: isDarkMode ? "2px solid #374151" : "2px solid #E2E8F0",
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}>
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: "50%", 
                                background: COLORS.ahead,
                                boxShadow: `0 0 8px ${COLORS.ahead}80`
                              }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: isDarkMode ? "#9ca3af" : "#64748B", fontSize: "0.85rem" }}>
                                {day.topics.filter(t => t.completed).length} of {day.topics.length} completed
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <Box sx={{ textAlign: "center", py: 4 }}>
                            <Typography color="textSecondary" sx={{ fontSize: "0.95rem" }}>
                              No topics for this day
                            </Typography>
                          </Box>
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
          <Paper 
            elevation={0} 
            sx={{ 
              p: 8, 
              textAlign: "center", 
              borderRadius: 3, 
              border: "2px dashed rgba(14, 165, 233, 0.3)",
              background: "linear-gradient(135deg, rgba(240, 249, 255, 0.5), rgba(255, 255, 255, 0.8))",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "rgba(14, 165, 233, 0.5)",
                background: "linear-gradient(135deg, rgba(240, 249, 255, 0.7), rgba(255, 255, 255, 0.9))",
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(14, 165, 233, 0.15)"
              }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(15, 118, 110, 0.15))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2
              }}>
                <Typography sx={{ fontSize: "2.5rem" }}>📚</Typography>
              </Box>
            </Box>
            <Typography variant="h5" sx={{ color: "#0f766e", fontWeight: 700, mb: 1.5, fontSize: "1.5rem" }}>
              No Plan Generated Yet
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748B", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
              Choose a subject and click "Generate Plan" to start your learning journey!
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  py: 1.2,
                  boxShadow: "0 4px 14px rgba(15, 118, 110, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(15, 118, 110, 0.4)",
                    transform: "translateY(-2px)"
                  }
                }}
                onClick={() => document.querySelector('[aria-label="Subject"]')?.parentElement?.focus()}
              >
                Get Started
              </Button>
            </Box>
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
          isUserAdmin() ? (
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
