import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, PawPrint, SlidersHorizontal, UserCheck2, Home, Globe2, Heart, Star, Zap, Shield, Users, Car, GraduationCap, Building, Sparkles, Target, Award, Compass, Droplet, Trash2, CloudRain, Footprints, Leaf, Dumbbell, ShoppingCart, Landmark, User, Accessibility, Wifi, Baby, ShieldCheck, Wallet, Calendar, Languages, Monitor, Ban, School, HeartPulse, Book } from 'lucide-react';
import axios from 'axios';
import './UserPreferenceForm.css';

const UserPreferenceForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [step5Completed, setStep5Completed] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [formData, setFormData] = useState({
    location: '',
    rangeKm: 10,
    petFriendly: false,
    behavior: {
      remoteWork: false,
      hasChildren: false,
      ownsPet: false,
      frequentTraveler: false,
      elderlyFamily: false,
      socialCommunity: false,
      startupProfessional: false,
      shortCommute: false,
      nightlife: false,
      fitness: false,
      healthcare: false,
      shopping: false,
      culture: false,
      elderly: false,
      childcare: false,
      safety: false,
      internet: false,
      diversity: false,
      parking: false,
      accessibility: false
    },
    userProfile: {
      isStudent: false,
      livesWithFamily: false,
      propertyPurpose: 'rent',
      mobilityNeeds: false,
      carOwner: false,
      multilingualArea: false,
      ageGroup: '',
      maritalStatus: '',
      householdSize: 1,
      hasPets: false,
      budget: '',
      moveInDate: '',
      workLocation: '',
      languages: '',
      workspace: false,
      healthNeeds: false,
      floorType: '',
      parking: false,
      security: false,
      smokeFree: false,
      schooling: false,
      communityActivities: false
    },
    preferences: {
      school: false,
      college: false,
      mall: false,
      market: false,
      cinema: false,
      gym: false,
      garden: false,
      police: false,
      hospital: false,
      train: false,
      bus: false,
      taxi: false,
      airport: false
    },
    environment: {
      lowTraffic: false,
      goodRoads: false,
      greenArea: false,
      quiet: false,
      airQuality: false,
      waterQuality: false,
      lighting: false,
      waste: false,
      flooding: false,
      walkability: false,
      nature: false,
      community: false,
      petFriendlyEnv: false
    }
  });

  // Update selected count for current step
  useEffect(() => {
    let count = 0;
    if (step === 2) {
      count = Object.values(formData.preferences).filter(Boolean).length;
    } else if (step === 3) {
      count = Object.values(formData.environment).filter(Boolean).length;
    } else if (step === 4) {
      count = Object.values(formData.behavior).filter(Boolean).length;
    } else if (step === 5) {
      count = Object.values(formData.userProfile).filter(val => val !== 'rent' && val !== 'buy' && Boolean(val)).length;
    }
    setSelectedCount(count);
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (step !== 5) {
      console.log('Input change on step', step, '- preventing any submission logic');
    }

    if (step === 2 && name in formData.preferences) {
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: checked }
      }));
    } else if (step === 3 && name in formData.environment) {
      setFormData(prev => ({
        ...prev,
        environment: { ...prev.environment, [name]: checked }
      }));
    } else if (step === 4 && name in formData.behavior) {
      setFormData(prev => ({
        ...prev,
        behavior: { ...prev.behavior, [name]: checked }
      }));
    } else if (step === 5 && name in formData.userProfile) {
      setFormData(prev => ({
        ...prev,
        userProfile: {
          ...prev.userProfile,
          [name]: type === 'checkbox' ? checked : value
        }
      }));
      markStep5Completed();
    } else if (name === 'petFriendly') {
      setFormData(prev => ({ ...prev, petFriendly: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step !== 5) {
      e.preventDefault();
      setError('Please complete all steps before submitting. Press Next to continue.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submit event triggered. Current step:', step, 'Step 5 completed:', step5Completed);
    
    if (step !== 5) {
      console.log('Form submission blocked: Not on step 5. Current step:', step);
      setError('Please complete all steps before submitting. You are currently on step ' + step + ' of 5.');
      return;
    }
    
    if (!step5Completed) {
      console.log('Form submission blocked: Step 5 not explicitly completed');
      setError('Please complete the Property Profile section before submitting.');
      return;
    }
    
    if (!formData.location.trim()) {
      setError('Please enter your preferred location.');
      return;
    }
    
    const hasAmenities = Object.values(formData.preferences).some(pref => pref);
    const hasEnvironment = Object.values(formData.environment).some(env => env);
    const hasBehavior = Object.values(formData.behavior).some(behavior => behavior);
    
    if (!hasAmenities || !hasEnvironment || !hasBehavior) {
      setError('Please complete all previous steps before submitting.');
      return;
    }
    
    console.log('Form submission allowed: Step 5 completed successfully');
    
    if (step !== 5 || !step5Completed) {
      console.error('CRITICAL ERROR: Step validation failed during API call');
      setError('Form validation error. Please refresh and try again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log('Making API call with form data:', formData);
      const response = await axios.post('/combined', formData);
      setResults(response.data);
      console.log("API Response:", response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch matches. Please try again.');
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.location.trim()) {
      setError('Please enter your preferred location.');
      return;
    }
    if (step === 2 && Object.values(formData.preferences).every(pref => !pref)) {
      setError('Please select at least one amenity preference.');
      return;
    }
    if (step === 3 && Object.values(formData.environment).every(env => !env)) {
      setError('Please select at least one environmental preference.');
      return;
    }
    if (step === 4 && Object.values(formData.behavior).every(behavior => !behavior)) {
      setError('Please answer at least one lifestyle question.');
      return;
    }
    
    setError(null);
    
    if (step === 4) {
      setStep5Completed(false);
    }
    
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => setStep(prev => prev - 1);

  const resetForm = () => {
    setStep(1);
    setResults(null);
    setError(null);
    setStep5Completed(false);
    setSelectedCount(0);
    setFormData({
      location: '',
      rangeKm: 10,
      petFriendly: false,
      behavior: {
        remoteWork: false,
        hasChildren: false,
        ownsPet: false,
        frequentTraveler: false,
        elderlyFamily: false,
        socialCommunity: false,
        startupProfessional: false,
        shortCommute: false,
        nightlife: false,
        fitness: false,
        healthcare: false,
        shopping: false,
        culture: false,
        elderly: false,
        childcare: false,
        safety: false,
        internet: false,
        diversity: false,
        parking: false,
        accessibility: false
      },
      userProfile: {
        isStudent: false,
        livesWithFamily: false,
        propertyPurpose: 'rent',
        mobilityNeeds: false,
        carOwner: false,
        multilingualArea: false,
        ageGroup: '',
        maritalStatus: '',
        householdSize: 1,
        hasPets: false,
        budget: '',
        moveInDate: '',
        workLocation: '',
        languages: '',
        workspace: false,
        healthNeeds: false,
        floorType: '',
        parking: false,
        security: false,
        smokeFree: false,
        schooling: false,
        communityActivities: false
      },
      preferences: {
        school: false,
        college: false,
        mall: false,
        market: false,
        cinema: false,
        gym: false,
        garden: false,
        police: false,
        hospital: false,
        train: false,
        bus: false,
        taxi: false,
        airport: false
      },
      environment: {
        lowTraffic: false,
        goodRoads: false,
        greenArea: false,
        quiet: false,
        airQuality: false,
        waterQuality: false,
        lighting: false,
        waste: false,
        flooding: false,
        walkability: false,
        nature: false,
        community: false,
        petFriendlyEnv: false
      }
    });
  };

  const markStep5Completed = () => {
    if (step === 5) {
      setStep5Completed(true);
      console.log('Step 5 marked as completed');
    }
  };

  const getStepIcon = (stepNumber) => {
    const icons = [MapPin, SlidersHorizontal, Globe2, UserCheck2, Home];
    return icons[stepNumber - 1] || MapPin;
  };

  const getStepTitle = (stepNumber) => {
    const titles = ['Location', 'Amenities', 'Environment', 'Lifestyle', 'Profile'];
    return titles[stepNumber - 1] || 'Step';
  };

  const getStepDescription = (stepNumber) => {
    const descriptions = [
      'Tell us where you want to live',
      'What facilities do you need nearby?',
      'What\'s your ideal environment?',
      'Tell us about your lifestyle',
      'Final details about you'
    ];
    return descriptions[stepNumber - 1] || '';
  };

  const getStepColor = (stepNumber) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500', 
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-600'
    ];
    return colors[stepNumber - 1] || 'from-blue-500 to-cyan-500';
  };

  return (
    <div className="user-preference-form">

      
      {/* Background Elements */}
      <div className="form-background"></div>

      <motion.div
        className="form-main-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="form-header">
          <motion.div
            className="form-header-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>AI-Powered Neighborhood Matching</span>
            <Sparkles className="w-5 h-5 text-purple-600" />
          </motion.div>
          
          <motion.h1 
            className="form-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Find Your Perfect
            <br />
            <span>Neighborhood Match</span>
          </motion.h1>
          
          <motion.p 
            className="form-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Let's discover the ideal place that matches your lifestyle, preferences, and dreams. 
            <br />
            <span>Our AI will find neighborhoods with 95%+ accuracy!</span>
          </motion.p>
        </div>

        {/* Main Form Container */}
        <motion.div
          className="form-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Progress Bar */}
          <div className={`form-progress ${getStepColor(step)}`}>
            <div className="progress-header">
              <div className="progress-info">
                <motion.div 
                  className="progress-icon"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {React.createElement(getStepIcon(step), { className: "w-8 h-8 text-white" })}
                </motion.div>
                <div>
                  <h2 className="progress-title">
                    {getStepTitle(step)}
                  </h2>
                  <p className="progress-description">
                    {getStepDescription(step)}
                  </p>
                </div>
              </div>
              <div className="progress-stats">
                <div className="progress-step">
                  Step {step} of 5
                </div>
                <div className="progress-percentage">
                  {Math.round((step / 5) * 100)}% Complete
                </div>
                {selectedCount > 0 && (
                  <motion.div 
                    className="progress-selected"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {selectedCount} selected
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-bar-track">
                <motion.div 
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <motion.div
                    className="progress-bar-shine"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              <div className="progress-labels">
                <span className="progress-label">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </span>
                <span className="progress-label">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Amenities</span>
                </span>
                <span className="progress-label">
                  <Globe2 className="w-4 h-4" />
                  <span>Environment</span>
                </span>
                <span className="progress-label">
                  <UserCheck2 className="w-4 h-4" />
                  <span>Lifestyle</span>
                </span>
                <span className="progress-label">
                  <Home className="w-4 h-4" />
                  <span>Profile</span>
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="form-content">
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="step1-container space-y-8 p-8 md:p-12 bg-gradient-to-br from-blue-50 to-green-50 shadow-2xl rounded-3xl border-2 border-blue-200"
                  >
                    <div className="text-center mb-10">
                      <div className="future-ai-badge">Find the Best Neighborhood <span className="future-ai-soon">— AI Matching Coming Soon!</span></div>
                      <motion.div 
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <MapPin className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 tracking-tight">Where's Your Dream Home?</h3>
                      <p className="text-gray-600 text-lg md:text-xl">Let's start by finding the perfect city or area for you</p>
                    </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      className=""
                      >
                      <label className="step1-label block text-xl font-bold text-gray-700 mb-4 flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                          <span>🌍 Your Preferred City or Area</span>
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., Mumbai, Delhi, Bangalore, Pune, Hyderabad..."
                        className="step1-input w-full px-8 py-6 text-xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-1"
                          required
                        />
                        <p className="text-gray-500 mt-2 text-sm">Enter the city or area where you'd like to live</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      className=""
                      >
                      <label className="step1-label block text-xl font-bold text-gray-700 mb-4 flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">2</span>
                          </div>
                        <span>📏 Search Radius: <span className="radius-value">{formData.rangeKm} km</span></span>
                        </label>
                      <div className="step1-radius custom-radius-slider">
                          <input
                            type="range"
                            name="rangeKm"
                            min="1"
                            max="30"
                            value={formData.rangeKm}
                            onChange={handleChange}
                          className="custom-slider"
                          />
                        <div className="radius-labels">
                            <span>1 km</span>
                            <span>15 km</span>
                            <span>30 km</span>
                          </div>
                        </div>
                      </motion.div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="amenities-section"
                  >
                    <div className="text-center mb-10">
                      <motion.div 
                        className="amenities-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <SlidersHorizontal className="w-12 h-12" />
                      </motion.div>
                      <h3 className="amenities-title">What Makes Life Convenient?</h3>
                      <p className="amenities-desc">Select the facilities that matter most to your daily life</p>
                    </div>

                    <div className="amenities-grid">
                      {Object.entries({
                        school: { icon: GraduationCap, label: 'Schools & Education', color: 'blue', description: 'For families and students' },
                        hospital: { icon: Shield, label: 'Hospitals & Healthcare', color: 'red', description: 'Medical facilities nearby' },
                        mall: { icon: Building, label: 'Shopping Malls', color: 'purple', description: 'Retail and entertainment' },
                        gym: { icon: Zap, label: 'Gyms & Fitness', color: 'orange', description: 'Health and wellness' },
                        garden: { icon: Heart, label: 'Parks & Gardens', color: 'green', description: 'Green spaces and recreation' },
                        train: { icon: Users, label: 'Train Stations', color: 'indigo', description: 'Public transportation' },
                        bus: { icon: Car, label: 'Bus Stops', color: 'teal', description: 'Local connectivity' },
                        cinema: { icon: Star, label: 'Cinemas & Entertainment', color: 'pink', description: 'Movies and leisure' }
                      }).map(([key, { icon: Icon, label, color, description }], index) => (
                        <motion.label
                          key={key}
                          className={`amenity-card ${formData.preferences[key] ? 'selected' : ''}`}
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <input
                            type="checkbox"
                            name={key}
                            checked={formData.preferences[key]}
                            onChange={handleChange}
                            className="sr-only custom-checkbox"
                          />
                          <div className="amenity-icon-container">
                            <Icon className="amenity-icon" />
                              </div>
                          <div className="amenity-info">
                            <div className="amenity-label">{label}</div>
                            <div className="amenity-description">{description}</div>
                          </div>
                          {formData.preferences[key] && (
                            <div className="amenity-checkmark">
                              <Check className="checkmark-icon" />
                            </div>
                          )}
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="environment-section"
                  >
                    <div className="text-center mb-10">
                      <motion.div 
                        className="environment-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Globe2 className="w-12 h-12" />
                      </motion.div>
                      <h3 className="environment-title">What's Your Ideal Environment?</h3>
                      <p className="environment-desc">Choose the environmental factors that matter to you <span className="required">*</span></p>
                    </div>

                    <div className="environment-grid">
                      {[
                        { key: 'lowTraffic', icon: Shield, label: 'Low Traffic Areas', description: 'Peaceful neighborhoods with less congestion and noise' },
                        { key: 'goodRoads', icon: Car, label: 'Good Road Quality', description: 'Well-maintained roads and infrastructure for smooth travel' },
                        { key: 'greenArea', icon: Heart, label: 'Green Spaces', description: 'Parks, gardens, and natural surroundings for a healthy lifestyle' },
                        { key: 'quiet', icon: Star, label: 'Quiet & Peaceful', description: 'Low noise from traffic, nightlife, or construction' },
                        { key: 'airQuality', icon: Globe2, label: 'Clean Air', description: 'Good air quality, low pollution and dust' },
                        { key: 'waterQuality', icon: Droplet, label: 'Clean Water Supply', description: 'Reliable and clean water supply' },
                        { key: 'lighting', icon: Zap, label: 'Well-lit & Safe', description: 'Streets are well-lit and safe at night' },
                        { key: 'waste', icon: Trash2, label: 'Cleanliness & Waste', description: 'Regular garbage collection, clean public spaces' },
                        { key: 'flooding', icon: CloudRain, label: 'No Flooding', description: 'No waterlogging or flooding during rains' },
                        { key: 'walkability', icon: Footprints, label: 'Walkable Area', description: 'Safe sidewalks and pedestrian crossings' },
                        { key: 'nature', icon: Leaf, label: 'Proximity to Nature', description: 'Parks, lakes, or reserves nearby' },
                        { key: 'community', icon: Users, label: 'Community Events', description: 'Regular events, markets, or gatherings' },
                        { key: 'petFriendlyEnv', icon: PawPrint, label: 'Pet-Friendly', description: 'Parks and facilities for pets' }
                      ].map(({ key, icon: Icon, label, description }, index) => (
                        <motion.label
                          key={key}
                          className={`environment-card ${formData.environment[key] ? 'selected' : ''}`}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.07 }}
                        >
                          <input
                            type="checkbox"
                            name={key}
                            checked={formData.environment[key] || false}
                            onChange={handleChange}
                            className="sr-only custom-checkbox"
                          />
                          <div className="environment-icon-container">
                            <Icon className="environment-icon-svg" />
                              </div>
                          <div className="environment-info">
                            <div className="environment-label">{label}</div>
                            <div className="environment-description">{description}</div>
                            </div>
                            {formData.environment[key] && (
                            <div className="environment-checkmark">
                              <Check className="environment-checkmark-icon" />
                          </div>
                          )}
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="lifestyle-section"
                  >
                    <div className="text-center mb-10">
                      <motion.div 
                        className="lifestyle-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <UserCheck2 className="w-12 h-12" />
                      </motion.div>
                      <h3 className="lifestyle-title">Tell Us About Your Lifestyle</h3>
                      <p className="lifestyle-desc">Help us understand your daily routine and preferences <span className="required">*</span></p>
                    </div>

                    <div className="lifestyle-grid">
                      {[
                        { key: 'remoteWork', icon: Zap, label: 'I work remotely', description: 'Need a quiet environment for focused work' },
                        { key: 'hasChildren', icon: Heart, label: 'I have school-going children', description: 'Looking for family-friendly areas with good schools' },
                        { key: 'ownsPet', icon: PawPrint, label: 'I own a pet', description: 'Need pet-friendly surroundings and parks' },
                        { key: 'socialCommunity', icon: Users, label: 'I prefer social communities', description: 'Like active neighborhood life and events' },
                        { key: 'startupProfessional', icon: Building, label: 'I\'m a startup professional', description: 'Need good infrastructure and connectivity' },
                        { key: 'frequentTraveler', icon: Car, label: 'I travel frequently', description: 'Need good connectivity and transport options' },
                        { key: 'shortCommute', icon: MapPin, label: 'Short Work Commute', description: 'I need a short commute to work or business hubs' },
                        { key: 'nightlife', icon: Star, label: 'Nightlife & Dining', description: 'I enjoy vibrant nightlife, cafes, and restaurants' },
                        { key: 'fitness', icon: Dumbbell, label: 'Fitness & Wellness', description: 'I want easy access to gyms, yoga, or wellness centers' },
                        { key: 'healthcare', icon: Shield, label: 'Healthcare Access', description: 'Proximity to hospitals or clinics is important' },
                        { key: 'shopping', icon: ShoppingCart, label: 'Shopping & Groceries', description: 'I want markets, supermarkets, or malls nearby' },
                        { key: 'culture', icon: Landmark, label: 'Cultural/Religious Centers', description: 'I value being near cultural or religious centers' },
                        { key: 'elderly', icon: User, label: 'Elderly-Friendly', description: 'I need facilities for elderly family members' },
                        { key: 'childcare', icon: Baby, label: 'Childcare & Play Areas', description: 'I need access to daycares or children\'s play areas' },
                        { key: 'safety', icon: ShieldCheck, label: 'Community Safety', description: 'I want to live in a low-crime, safe neighborhood' },
                        { key: 'internet', icon: Wifi, label: 'Internet & Connectivity', description: 'High-speed internet or good mobile coverage is essential' },
                        { key: 'diversity', icon: Users, label: 'Diversity & Inclusion', description: 'I prefer multicultural, inclusive communities' },
                        { key: 'parking', icon: Car, label: 'Parking & Vehicle Needs', description: 'I need easy parking or EV charging' },
                        { key: 'accessibility', icon: Accessibility, label: 'Accessibility', description: 'Wheelchair/stroller accessibility is important' }
                      ].map(({ key, icon: Icon, label, description }, index) => (
                        <motion.label
                          key={key}
                          className={`lifestyle-card ${formData.behavior[key] ? 'selected' : ''}`}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.07 }}
                        >
                          <input
                            type="checkbox"
                            name={key}
                            checked={formData.behavior[key] || false}
                            onChange={handleChange}
                            className="sr-only custom-checkbox"
                          />
                          <div className="lifestyle-icon-container">
                            <Icon className="lifestyle-icon-svg" />
                              </div>
                          <div className="lifestyle-info">
                            <div className="lifestyle-label">{label}</div>
                            <div className="lifestyle-description">{description}</div>
                            </div>
                            {formData.behavior[key] && (
                            <div className="lifestyle-checkmark">
                              <Check className="lifestyle-checkmark-icon" />
                          </div>
                          )}
                        </motion.label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="profile-section"
                  >
                    <div className="text-center mb-10">
                      <motion.div 
                        className="profile-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Home className="w-12 h-12" />
                      </motion.div>
                      <h3 className="profile-title">Final Details About You</h3>
                      <p className="profile-desc">Help us find the perfect match for your situation <span className="required">*</span></p>
                    </div>

                    <div className="profile-grid">
                      {[
                        { key: 'isStudent', icon: GraduationCap, label: 'I\'m a student', description: 'Looking for student accommodation near colleges' },
                        { key: 'livesWithFamily', icon: Users, label: 'I live with family', description: 'Need family-oriented areas with good amenities' },
                        { key: 'carOwner', icon: Car, label: 'I own a car', description: 'Need parking facilities and good road connectivity' },
                        { key: 'mobilityNeeds', icon: Accessibility, label: 'I have mobility needs', description: 'Need accessible facilities and infrastructure' },
                        { key: 'multilingualArea', icon: Globe2, label: 'I prefer diverse communities', description: 'Like multilingual areas with cultural diversity' },
                        { key: 'ageGroup', icon: User, label: 'Age Group', description: 'Student, Young Professional, Family, Retiree, Senior' },
                        { key: 'maritalStatus', icon: Heart, label: 'Marital Status', description: 'Single, Married, Living with Partner' },
                        { key: 'householdSize', icon: Users, label: 'Household Size', description: 'How many people will live with you?' },
                        { key: 'hasPets', icon: PawPrint, label: 'I have pets', description: 'Do you have pets? (type/number)' },
                        { key: 'budget', icon: Wallet, label: 'Budget Range', description: 'What is your budget range?' },
                        { key: 'moveInDate', icon: Calendar, label: 'Preferred Move-in Date', description: 'When do you plan to move?' },
                        { key: 'workLocation', icon: MapPin, label: 'Work/Study Location', description: 'Is your work/study location fixed or flexible?' },
                        { key: 'languages', icon: Languages, label: 'Languages Spoken', description: 'What languages do you speak at home?' },
                        { key: 'workspace', icon: Monitor, label: 'Workspace Needs', description: 'Do you need a dedicated workspace at home?' },
                        { key: 'healthNeeds', icon: HeartPulse, label: 'Health/Accessibility Needs', description: 'Any special health or accessibility requirements?' },
                        { key: 'floorType', icon: Building, label: 'Preferred Floor/Building Type', description: 'Ground floor, high-rise, gated community, etc.' },
                        { key: 'parking', icon: Car, label: 'Parking/EV Charging', description: 'Do you need parking or EV charging?' },
                        { key: 'security', icon: ShieldCheck, label: 'Security Preferences', description: 'Gated security, CCTV, etc.' },
                        { key: 'smokeFree', icon: Ban, label: 'Smoke-Free Environment', description: 'Do you prefer a smoke-free environment?' },
                        { key: 'schooling', icon: School, label: "Children's Schooling", description: 'Do you need proximity to schools or daycares?' },
                        { key: 'communityActivities', icon: Users, label: 'Community Activities', description: 'Are you interested in community events, clubs, or sports?' }
                      ].map(({ key, icon: Icon, label, description }, index) => (
                        <motion.label
                          key={key}
                          className={`profile-card ${formData.userProfile[key] ? 'selected' : ''}`}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.07 }}
                        >
                          <input
                            type="checkbox"
                            name={key}
                            checked={formData.userProfile[key] || false}
                            onChange={handleChange}
                            className="sr-only custom-checkbox"
                          />
                          <div className="profile-icon-container">
                            <Icon className="profile-icon-svg" />
                              </div>
                          <div className="profile-info">
                            <div className="profile-label">{label}</div>
                            <div className="profile-description">{description}</div>
                            </div>
                            {formData.userProfile[key] && (
                            <div className="profile-checkmark">
                              <Check className="profile-checkmark-icon" />
                          </div>
                          )}
                        </motion.label>
                      ))}
                          </div>
                    <div className="profile-purpose">
                      <label className="profile-purpose-label">
                        <span className="profile-purpose-icon">🏠</span>
                        Property Purpose
                        </label>
                        <select 
                          name="propertyPurpose" 
                          value={formData.userProfile.propertyPurpose} 
                          onChange={handleChange}
                        className="profile-purpose-select"
                        >
                          <option value="rent">I want to rent a property</option>
                          <option value="buy">I want to buy a property</option>
                        </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Navigation Buttons */}
              <div className="flex justify-between items-center pt-10 mt-10 border-t border-gray-200 w-full">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="step1-back-btn"
                  >
                    <span className="back-arrow">←</span> Back
                  </button>
                ) : <div className="invisible" />}
                {step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="step1-next-btn"
                  >
                    Next <span className="next-arrow">→</span>
                  </button>
                ) : step === 5 ? (
                  <div className="flex items-center space-x-6 ml-auto">
                    {step5Completed ? (
                      <button
                        type="submit"
                        className="step1-find-btn"
                      >
                        <span className="find-icon">🔍</span> Find the Matching
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-10 py-4 bg-gray-300 text-gray-500 rounded-2xl font-bold cursor-not-allowed shadow-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        Complete Profile First
                      </button>
                    )}
                  </div>
                ) : <div className="invisible" />}
              </div>
            </form>

            {/* Enhanced Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <p className="text-red-700 font-bold text-lg">{error}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Results Display */}
        {results && step === 5 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '30px 30px'
                }}></div>
              </div>
              
              <div className="relative z-10 text-center">
                <motion.div
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  🎉 Your Perfect Neighborhood Matches
                </h3>
                <p className="text-white/90 text-lg">Recommendations with 95%+ accuracy</p>
              </div>
            </div>
            
            <div className="p-10">
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4 bg-white rounded-2xl shadow-md">
                    <div className="text-2xl mb-2">📍</div>
                    <div className="font-bold text-blue-700">Search Location</div>
                    <div className="text-blue-600">{results.searchLocation}</div>
                    <div className="text-sm text-blue-500">({results.searchRadius}km radius)</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-md">
                    <div className="text-2xl mb-2">🏘️</div>
                    <div className="font-bold text-blue-700">Areas Evaluated</div>
                    <div className="text-blue-600">{results.totalAreasEvaluated || 'N/A'}</div>
                    <div className="text-sm text-blue-500">neighborhoods analyzed</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl shadow-md">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-bold text-blue-700">Match Accuracy</div>
                    <div className="text-blue-600">95%+</div>
                    <div className="text-sm text-blue-500">AI-powered precision</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                {results.topMatches?.map((match, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                          }`}
                          animate={index === 0 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {index === 0 ? <Award className="w-8 h-8 text-white" /> : <Star className="w-8 h-8 text-white" />}
                        </motion.div>
                        <div>
                          <h4 className="text-2xl font-bold text-gray-800">
                            {match.name}
                          </h4>
                          {index === 0 && (
                            <div className="text-sm text-yellow-600 font-bold">🏆 BEST MATCH</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-6 py-3 rounded-full text-lg font-bold ${
                          match.score >= 80 ? 'bg-green-100 text-green-800' :
                          match.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          match.score >= 40 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Score: {match.score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                    {/* Unified Highlights Section */}
                    <div className="pt-6 border-t-2 border-gray-100">
                      <p className="text-lg font-bold text-gray-700 mb-4 flex items-center space-x-2">
                        <Target className="w-5 h-5 text-green-600" />
                        <span>Nearby Essentials & Highlights:</span>
                      </p>
                      <ul className="space-y-3">
                        {/* Visual breakdown as highlights */}
                        <li className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="mt-1 flex-shrink-0">✓</span>
                          <span className="flex items-center"><Car className="inline w-5 h-5 text-red-500 mr-1" />Traffic: <b className="ml-1">{match.traffic}/5</b></span>
                        </li>
                        <li className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="mt-1 flex-shrink-0">✓</span>
                          <span className="flex items-center"><MapPin className="inline w-5 h-5 text-blue-500 mr-1" />Roads: <b className="ml-1">{match.road_quality}/5</b></span>
                        </li>
                        <li className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="mt-1 flex-shrink-0">✓</span>
                          <span className="flex items-center"><Heart className="inline w-5 h-5 text-green-500 mr-1" />Green: <b className="ml-1">{match.green_area}/5</b></span>
                        </li>
                        <li className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="mt-1 flex-shrink-0">✓</span>
                          <span className="flex items-center"><Users className="inline w-5 h-5 text-purple-500 mr-1" />Community: <b className="ml-1">{match.community_rating}/5</b></span>
                        </li>
                        {/* Family Safe, Pet Friendly, Accessible as highlights */}
                        <li className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="mt-1 flex-shrink-0">✓</span>
                          <span className="flex items-center"><ShieldCheck className="inline w-5 h-5 text-green-500 mr-1" />Family Safe: <b className="ml-1">{match.family_safe ? 'Yes' : 'No'}</b></span>
                        </li>
                        <li className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="mt-1 flex-shrink-0">✓</span>
                          <span className="flex items-center"><PawPrint className="inline w-5 h-5 text-orange-500 mr-1" />Pet Friendly: <b className="ml-1">{match.pet_friendly ? 'Yes' : 'No'}</b></span>
                        </li>
                        <li className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="mt-1 flex-shrink-0">✓</span>
                          <span className="flex items-center"><Accessibility className="inline w-5 h-5 text-blue-500 mr-1" />Accessible: <b className="ml-1">{match.accessibility_friendly ? 'Yes' : 'No'}</b></span>
                        </li>
                        {/* Places details as highlights */}
                        {match.places && Object.entries(match.places).map(([category, places], idx) => {
                          if (!places || places.length === 0) return null;
                          const iconMap = {
                            schools: <GraduationCap className="inline w-5 h-5 text-blue-500 mr-1" />, // school
                            hospitals: <Shield className="inline w-5 h-5 text-red-500 mr-1" />, // hospital
                            gyms: <Dumbbell className="inline w-5 h-5 text-orange-500 mr-1" />, // gym
                            gardens: <Heart className="inline w-5 h-5 text-green-500 mr-1" />, // park/garden
                            malls: <Building className="inline w-5 h-5 text-purple-500 mr-1" />, // mall
                            markets: <ShoppingCart className="inline w-5 h-5 text-pink-500 mr-1" />, // market
                            universities: <School className="inline w-5 h-5 text-indigo-500 mr-1" />, // university
                            colleges: <Book className="inline w-5 h-5 text-yellow-500 mr-1" />, // college
                            transport_connectivity: <Car className="inline w-5 h-5 text-teal-500 mr-1" /> // transit
                          };
                          const best = places.reduce((prev, curr) => (curr.rating && (!prev.rating || curr.rating > prev.rating)) ? curr : prev, places[0]);
                          return (
                            <li key={category} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                              <span className="mt-1 flex-shrink-0">✓</span>
                              <span className="flex items-center">
                                {iconMap[category] || <Star className="inline w-5 h-5 text-gray-400 mr-1" />}<b className="capitalize">{category.replace(/_/g, ' ')}</b> nearby ({places.length} found)
                                {best && (
                                  <span className="ml-2 text-gray-700">➜ Best: "{best.name}"{best.rating ? ` (${best.rating}★` : ''}{best.distance_km ? `, ${best.distance_km.toFixed(1)}km` : ''}{best.rating ? ')' : ''}</span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Reset Button */}
              <div className="mt-12 text-center">
                <motion.button
                  type="button"
                  onClick={resetForm}
                  className="px-12 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center space-x-3">
                    <Compass className="w-6 h-6" />
                    <span>Start New Search</span>
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

    </div>
  );
};

export default UserPreferenceForm;
