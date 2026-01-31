import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RiArrowLeftLine, RiMagicLine, RiAddLine, RiCloseLine, RiMicLine, RiUploadLine } from 'react-icons/ri';
import { TbCrop, TbPalette, TbRotateClockwise } from 'react-icons/tb';
import { HiArrowLongRight } from 'react-icons/hi2';
import Spinner from './common/Spinner';
import { generateImage } from '../services/geminiService';
import ImageSelectionModal from './common/ImageSelectionModal';
import InteractiveImage from './common/InteractiveImage';
import type { VsPost } from '../types';
import { LuImage } from 'react-icons/lu';
import { TbPhotoSearch } from 'react-icons/tb';
import { posts as postsService } from '../services/supabaseService';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

type CreationType = 'classic' | 'match-up';
type WizardStep = 'type_choice' | 'details' | 'images';

interface CreationWizardProps {
  posts: VsPost[];
  editPost?: VsPost | null;
  onClose: () => void;
  onCreateClassic: (postData: Omit<VsPost, 'id' | 'userVote' | 'author' | 'comments' | 'topic' | 'type'>) => void;
  onCreateMatchUp: (title: string, challengers: string[]) => Promise<void>;
}

const CreationWizard: React.FC<CreationWizardProps> = ({ posts, editPost, onClose, onCreateClassic, onCreateMatchUp }) => {
  // Initialize step based on edit mode
  const [step, setStep] = useState<WizardStep>(editPost ? 'details' : 'type_choice');
  const [creationType, setCreationType] = useState<CreationType>(editPost?.type === 'match-up' ? 'match-up' : 'classic');
  const [isProcessing, setIsProcessing] = useState(false);

  // Classic state - pre-fill if editing
  const [classicDetails, setClassicDetails] = useState({ 
    title: editPost?.title || '', 
    optionA_name: editPost?.optionA?.name || '', 
    optionB_name: editPost?.optionB?.name || '' 
  });
  const [images, setImages] = useState<{ A: string | null, B: string | null }>({ 
    A: editPost?.optionA?.imageUrl || null, 
    B: editPost?.optionB?.imageUrl || null 
  });
  const [loadingImages, setLoadingImages] = useState<{ A: boolean, B: boolean }>({ A: false, B: false });
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [backgroundColors, setBackgroundColors] = useState<{ A: string, B: string }>({ 
    A: editPost?.optionA?.backgroundColor || '#000000', 
    B: editPost?.optionB?.backgroundColor || '#000000' 
  });
  const [aspectRatio, setAspectRatio] = useState<'1/1.2' | '1/1.5'>(editPost?.aspectRatio || '1/1.5');
  const [imageTransforms, setImageTransforms] = useState<{ A: any, B: any }>({ 
    A: editPost?.optionA?.imageTransform || { scale: 1, translateX: 0, translateY: 0, objectFit: 'cover' },
    B: editPost?.optionB?.imageTransform || { scale: 1, translateX: 0, translateY: 0, objectFit: 'cover' }
  });
  
  // Match-up state
  const [matchUpDetails, setMatchUpDetails] = useState({ title: '', challengers: '' });
  const [matchUpImages, setMatchUpImages] = useState<Record<number, string | null>>({});
  const [matchUpBackgroundColors, setMatchUpBackgroundColors] = useState<Record<number, string>>({});
  const [matchUpImageTransforms, setMatchUpImageTransforms] = useState<Record<number, any>>({});
  const [matchUpRotations, setMatchUpRotations] = useState<Record<number, number>>({});
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  // Voice Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageTarget, setImageTarget] = useState<'A' | 'B' | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTarget, setImageModalTarget] = useState<'A' | 'B' | null>(null);
  
  // Inline editing state
  const [cropModeActive, setCropModeActive] = useState<{ A: boolean, B: boolean }>({ A: false, B: false });
  const [showColorPicker, setShowColorPicker] = useState<{ A: boolean, B: boolean }>({ A: false, B: false });
  const [rotations, setRotations] = useState<{ A: number, B: number }>({ A: 0, B: 0 });
  const [matchUpCropModeActive, setMatchUpCropModeActive] = useState<Record<number, boolean>>({});
  const [matchUpShowColorPicker, setMatchUpShowColorPicker] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const separatorRegex = /\s(vs|versus)\s/i;
        const parts = transcript.split(separatorRegex);

        if (parts.length >= 3) {
            const contenderA = parts[0].trim();
            const contenderB = parts[2].trim();
            const formattedA = contenderA.charAt(0).toUpperCase() + contenderA.slice(1);
            const formattedB = contenderB.charAt(0).toUpperCase() + contenderB.slice(1);

            setClassicDetails(prev => ({ ...prev, optionA_name: formattedA, optionB_name: formattedB }));
            setDuplicateError(null);
        } else {
            alert(`Couldn't understand the format. Please say something like "Coke vs Pepsi".`);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      }

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
        alert("Sorry, your browser doesn't support voice recognition.");
        return;
    }
    if (isListening) {
        recognitionRef.current.stop();
    } else {
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
        alert("Sorry, your browser doesn't support voice recognition.");
        return;
    }
    
    // Create new recognition instance for matchup mode
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const matchupRecognition = new SpeechRecognition();
    matchupRecognition.continuous = false;
    matchupRecognition.lang = 'en-US';
    matchupRecognition.interimResults = false;
    matchupRecognition.maxAlternatives = 1;

    matchupRecognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      
      // Replace spoken "comma" with actual comma character
      // Handle variations: "comma", " comma ", "Comma", etc.
      const withCommas = transcript.replace(/\s+comma\s+/gi, ', ').replace(/\s+comma$/gi, ',').replace(/^comma\s+/gi, ',');
      
      // Split by actual commas and capitalize each name
      const names = withCommas.split(',').map(name => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      }).filter(Boolean).join(', ');
      
      setMatchUpDetails(prev => ({ ...prev, challengers: names }));
    };
    
    matchupRecognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    matchupRecognition.onend = () => {
      setIsListening(false);
    };

    matchupRecognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };


  // Debounced duplicate check - runs when user stops typing
  const checkForDuplicatesDebounced = useCallback((nameA: string, nameB: string) => {
    // Clear any pending check
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current);
    }
    
    // Don't check if either name is empty
    if (!nameA.trim() || !nameB.trim()) {
      setDuplicateError(null);
      setIsCheckingDuplicate(false);
      return;
    }
    
    setIsCheckingDuplicate(true);
    
    // Debounce: wait 500ms after user stops typing before checking
    duplicateCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const isDuplicate = await postsService.checkDuplicateBattle(
          nameA, 
          nameB, 
          editPost?.id // Exclude current post if editing
        );
        
        if (isDuplicate) {
          setDuplicateError('This matchup already exists. Please create a different one.');
        } else {
          setDuplicateError(null);
        }
      } catch (error) {
        console.error('Error checking for duplicates:', error);
        setDuplicateError(null); // Don't block on error
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 500);
  }, [editPost?.id]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current);
      }
    };
  }, []);

  // Check for duplicates when contestant names change
  useEffect(() => {
    if (creationType === 'classic' && step === 'details') {
      checkForDuplicatesDebounced(classicDetails.optionA_name, classicDetails.optionB_name);
    }
  }, [classicDetails.optionA_name, classicDetails.optionB_name, creationType, step, checkForDuplicatesDebounced]);

  const handleNext = async () => {
    if (step === 'details') {
      if (creationType === 'classic') {
        // Block if there's a duplicate error or still checking
        if (duplicateError || isCheckingDuplicate) {
            return;
        }
        setStep('images');
      } else {
        // Navigate to images step for matchup
        setStep('images');
      }
    } else if (step === 'images' && creationType === 'classic') {
        const finalPost: Omit<VsPost, 'id' | 'userVote' | 'author' | 'comments' | 'topic' | 'type'> = {
            title: classicDetails.title,
            aspectRatio,
            optionA: { 
                name: classicDetails.optionA_name, 
                imageUrl: images.A!, 
                votes: 0,
                backgroundColor: backgroundColors.A,
                imageTransform: imageTransforms.A
            },
            optionB: { 
                name: classicDetails.optionB_name, 
                imageUrl: images.B!, 
                votes: 0,
                backgroundColor: backgroundColors.B,
                imageTransform: imageTransforms.B
            },
            likes: 0,
            shares: 0
        };
        onCreateClassic(finalPost);
    } else if (step === 'images' && creationType === 'match-up') {
        // Post Match Up with images
        const challengers = matchUpDetails.challengers.split(',').map(c => c.trim()).filter(Boolean);
        setIsProcessing(true);
        try {
            await onCreateMatchUp(matchUpDetails.title, challengers);
        } catch (error) {
            alert("Failed to create match up. Please check console for details.");
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('type_choice');
    if (step === 'images') setStep('details');
  };

  const isNextDisabled = () => {
    if(isProcessing) return true;
    if (step === 'details') {
      if (creationType === 'classic') {
        return !classicDetails.optionA_name.trim() || !classicDetails.optionB_name.trim() || !!duplicateError || isCheckingDuplicate;
      }
      const challengers = matchUpDetails.challengers.split(',').map(c => c.trim()).filter(Boolean);
      return !matchUpDetails.title.trim() || challengers.length < 4 || challengers.length > 20;
    }
    if (step === 'images') {
      if (creationType === 'classic') {
        return !images.A || !images.B || loadingImages.A || loadingImages.B;
      } else {
        // Match-up: check all contestants have images
        const challengers = matchUpDetails.challengers.split(',').map(c => c.trim()).filter(Boolean);
        return challengers.some((_, idx) => !matchUpImages[idx]);
      }
    }
    return false;
  };

  const handleUploadImageClick = (target: 'A' | 'B' | number) => {
    setImageTarget(target);
    fileInputRef.current?.click();
  };

  const handleSelectImageClick = (target: 'A' | 'B' | number) => {
    setImageModalTarget(target);
    setShowImageModal(true);
  };

  // Matchup handlers
  const handleMatchUpToggleCrop = (index: number) => {
    setMatchUpCropModeActive(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleMatchUpCropConfirm = (index: number, croppedImageUrl: string) => {
    setMatchUpImages(prev => ({ ...prev, [index]: croppedImageUrl }));
    setMatchUpCropModeActive(prev => ({ ...prev, [index]: false }));
  };

  const handleMatchUpCropCancel = (index: number) => {
    setMatchUpCropModeActive(prev => ({ ...prev, [index]: false }));
  };

  const handleMatchUpToggleColorPicker = (index: number) => {
    setMatchUpShowColorPicker(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleMatchUpBackgroundColorChange = (index: number, color: string) => {
    setMatchUpBackgroundColors(prev => ({ ...prev, [index]: color }));
  };

  const handleMatchUpRotate = (index: number) => {
    setMatchUpRotations(prev => ({ ...prev, [index]: ((prev[index] || 0) + 90) % 360 }));
  };

  const handleMatchUpImageTransformChange = (index: number, transform: any) => {
    setMatchUpImageTransforms(prev => ({ ...prev, [index]: { ...transform, rotation: matchUpRotations[index] || 0 } }));
  };

  const handleToggleCrop = (target: 'A' | 'B') => {
    setCropModeActive(prev => ({ ...prev, [target]: !prev[target] }));
  };

  const handleCropConfirm = (target: 'A' | 'B', croppedImageUrl: string) => {
    setImages(prev => ({ ...prev, [target]: croppedImageUrl }));
    setCropModeActive(prev => ({ ...prev, [target]: false }));
  };

  const handleCropCancel = (target: 'A' | 'B') => {
    setCropModeActive(prev => ({ ...prev, [target]: false }));
  };

  const handleToggleColorPicker = (target: 'A' | 'B') => {
    setShowColorPicker(prev => ({ ...prev, [target]: !prev[target] }));
  };

  const handleBackgroundColorChange = (target: 'A' | 'B', color: string) => {
    setBackgroundColors(prev => ({ ...prev, [target]: color }));
  };

  const handleRotate = (target: 'A' | 'B') => {
    setRotations(prev => ({ ...prev, [target]: (prev[target] + 90) % 360 }));
  };

  const handleImageTransformChange = (target: 'A' | 'B', transform: any) => {
    setImageTransforms(prev => ({ ...prev, [target]: { ...transform, rotation: rotations[target] } }));
  };

  const handleImageSelected = (imageUrl: string) => {
    if (imageModalTarget) {
      if (creationType === 'classic') {
        setImages(prev => ({ ...prev, [imageModalTarget]: imageUrl }));
      } else if (creationType === 'match-up' && typeof imageModalTarget === 'number') {
        setMatchUpImages(prev => ({ ...prev, [imageModalTarget]: imageUrl }));
      }
    }
    setShowImageModal(false);
    setImageModalTarget(null);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (creationType === 'classic') {
      if (!imageTarget) return;
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          if (typeof loadEvent.target?.result === 'string') {
            setImages(prev => ({ ...prev, [imageTarget]: loadEvent.target.result as string }));
          }
        };
        reader.readAsDataURL(file);
      }
    } else if (creationType === 'match-up' && typeof imageTarget === 'number') {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          if (typeof loadEvent.target?.result === 'string') {
            setMatchUpImages(prev => ({ ...prev, [imageTarget]: loadEvent.target.result as string }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = ''; // Reset file input
  };

  const handleGenerateImage = async (target: 'A' | 'B') => {
    const optionName = target === 'A' ? classicDetails.optionA_name : classicDetails.optionB_name;
    const topic = classicDetails.title;
    if (!optionName || !topic) return;

    setLoadingImages(prev => ({ ...prev, [target]: true }));
    try {
        const imageUrl = await generateImage(optionName, topic);
        setImages(prev => ({...prev, [target]: imageUrl }));
    } catch (error) {
        console.error("Image generation failed:", error);
        alert("Sorry, we couldn't generate the image. Please try again.");
    } finally {
        setLoadingImages(prev => ({ ...prev, [target]: false }));
    }
  };

  const handleTypeSelect = (type: CreationType) => {
    setCreationType(type);
    setStep('details');
  };

  const renderMatchupContestant = (index: number, name: string, side: 'A' | 'B', hasRightContestant: boolean = true) => {
    const image = matchUpImages[index];
    const bgColor = matchUpBackgroundColors[index] || (side === 'A' ? '#000000' : '#FFFFFF');
    const rotation = matchUpRotations[index] || 0;
    const transform = matchUpImageTransforms[index] || { scale: 1, translateX: 0, translateY: 0, objectFit: 'cover' };
    const cropMode = matchUpCropModeActive[index] || false;
    const showColorPicker = matchUpShowColorPicker[index] || false;

    // Determine clipPath based on side and whether there's a right contestant
    let clipPath: string;
    if (side === 'A') {
      // Left side: use tilted edge when there's a right contestant, or when alone
      clipPath = hasRightContestant 
        ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        : 'polygon(0% 0%, 90% 0%, 100% 100%, 0% 100%)';
    } else {
      // Right side: always has tilted left edge
      clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 7% 100%)';
    }

    return (
      <div 
        key={index}
        className="absolute inset-0 w-[52%] h-full flex flex-col items-center justify-center"
        style={{ 
          backgroundColor: image ? bgColor : (side === 'A' ? '#2c2c2c' : '#f5f5f5'),
          clipPath,
          transformOrigin: 'center center',
          marginLeft: side === 'B' ? 'auto' : '0',
        }}
      >
        {image ? (
          <>
            <div 
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <InteractiveImage
                src={image}
                alt={name}
                containerClassName="absolute inset-0"
                initialTransform={transform}
                onTransformChange={(t) => handleMatchUpImageTransformChange(index, t)}
                showControls={true}
                cropMode={cropMode}
                onCropConfirm={(croppedUrl) => handleMatchUpCropConfirm(index, croppedUrl)}
                onCropCancel={() => handleMatchUpCropCancel(index)}
              />
            </div>
            
            {/* Inline editing controls */}
            <div className={`absolute bottom-3 ${side === 'A' ? 'left-3' : 'right-3'} flex gap-2 z-40`}>
              {/* Crop button */}
              <button
                onClick={() => handleMatchUpToggleCrop(index)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                  cropMode
                    ? 'bg-brand-lime text-black'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Crop"
              >
                <TbCrop className="w-5 h-5" />
              </button>
              
              {/* Background color button */}
              <div className="relative">
                <button
                  onClick={() => handleMatchUpToggleColorPicker(index)}
                  className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                  title="Background Color"
                >
                  <TbPalette className="w-5 h-5 text-gray-900 dark:text-white" />
                </button>
                
                {/* Color picker popup */}
                {showColorPicker && (
                  <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-xl z-50 min-w-[180px]">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => handleMatchUpBackgroundColorChange(index, e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                        <button
                          key={color}
                          onClick={() => handleMatchUpBackgroundColorChange(index, color)}
                          className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Rotate button */}
              <button
                onClick={() => handleMatchUpRotate(index)}
                className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                title="Rotate"
              >
                <TbRotateClockwise className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => handleUploadImageClick(index)}
            className="w-full h-full flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <LuImage className={`w-9 h-9 mx-auto mb-2 ${side === 'A' ? 'text-white' : 'text-gray-400'}`} />
            <p className={`font-semibold text-base ${side === 'A' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{name}</p>
          </button>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'type_choice':
        return (
          <div className="px-6 py-8 space-y-4">
               <button 
                  onClick={() => handleTypeSelect('classic')} 
                  className="w-full h-[25vh] p-8 bg-white dark:bg-gray-800 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left"
               >
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Classic</h3>
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-2">One vs One</p>
               </button>
               <button 
                  onClick={() => handleTypeSelect('match-up')} 
                  className="w-full h-[25vh] p-8 bg-white dark:bg-gray-800 rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left"
               >
                   <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Match Up</h3>
                   <p className="text-base text-gray-500 dark:text-gray-400 mt-2">Playoffs</p>
                </button>
          </div>
        );
      case 'details':
        if (creationType === 'classic') {
          return (
            <div className="px-6 py-8 flex flex-col h-full gap-12">
              <div className="mb-8">
                <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">Name your verses</h2>
                <p className="text-base text-gray-500 dark:text-gray-400">Add an optional title for your battle</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <input
                    type="text"
                    placeholder="Optional title"
                    value={classicDetails.title}
                    onChange={e => setClassicDetails(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-0 outline-none pb-3 mb-16 transition-colors"
                />

                <div className="flex items-end justify-center gap-4 mb-16">
                    <div className="flex-1">
                      <input
                          type="text"
                          placeholder="Black"
                          value={classicDetails.optionA_name}
                          onChange={e => {
                            setClassicDetails(prev => ({ ...prev, optionA_name: e.target.value }));
                            setDuplicateError(null);
                          }}
                          className="w-full text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-0 outline-none pb-3 transition-colors"
                      />
                    </div>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white pb-2">VS</span>
                    <div className="flex-1">
                      <input
                          type="text"
                          placeholder="White"
                          value={classicDetails.optionB_name}
                          onChange={e => {
                            setClassicDetails(prev => ({ ...prev, optionB_name: e.target.value }));
                            setDuplicateError(null);
                          }}
                          className="w-full text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-0 outline-none pb-3 transition-colors"
                      />
                    </div>
                </div>
              </div>

              {recognitionRef.current && (
                <div className="text-center flex-grow flex flex-col pb-8">
                  <p className="text-base text-gray-500 dark:text-gray-400 mb-4">Or say it loud (e.g. "Coke vs Pepsi")</p>
                  <button
                      type="button"
                      onClick={handleToggleListening}
                      className={`w-14 h-14 rounded-2xl mx-auto transition-all duration-300 flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                      <RiMicLine className="w-6 h-6" />
                  </button>
                  {isListening && <p className="text-sm text-red-500 dark:text-red-400 mt-3 animate-pulse">Listening...</p>}
                </div>
              )}

              {isCheckingDuplicate && (
                <p className="text-gray-500 text-center mt-4 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                  Checking for duplicates...
                </p>
              )}
              {duplicateError && !isCheckingDuplicate && <p className="text-red-500 text-center mt-4">{duplicateError}</p>}
            </div>
          );
        } else { // Match Up
          return (
            <div className="px-6 py-8 flex flex-col h-full gap-12">
              <div className="mb-8">
                <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">Name your match-up</h2>
                <p className="text-base text-gray-500 dark:text-gray-400">Add a title and list of competitors</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <input
                    type="text"
                    placeholder="Optional title"
                    value={matchUpDetails.title}
                    onChange={e => setMatchUpDetails(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-0 outline-none pb-3 mb-16 transition-colors"
                />

                <textarea
                    placeholder="Enter 4 to 20 names, separated by commas... e.g., Jordan, LeBron, Kobe, Shaq..."
                    value={matchUpDetails.challengers}
                    onChange={e => setMatchUpDetails(prev => ({ ...prev, challengers: e.target.value }))}
                    className="w-full h-32 text-lg bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-900 dark:focus:border-white focus:ring-0 rounded-lg outline-none p-4 transition-colors resize-none"
                    rows={4}
                />
              </div>

              {recognitionRef.current && (
                <div className="text-center flex-grow flex flex-col pb-8">
                  <p className="text-base text-gray-500 dark:text-gray-400 mb-4">Or say it loud (e.g. "Jordan, LeBron, Kobe, Shaq")</p>
                  <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      className={`w-14 h-14 rounded-2xl mx-auto transition-all duration-300 flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                      <RiMicLine className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )
        }
      case 'images':
        if (creationType === 'match-up') {
          // Match-up carousel view
          const challengers = matchUpDetails.challengers.split(',').map(c => c.trim()).filter(Boolean);
          const totalPairs = Math.ceil(challengers.length / 2);
          const leftIndex = currentPairIndex * 2;
          const rightIndex = leftIndex + 1;
          const leftContestant = challengers[leftIndex];
          const rightContestant = challengers[rightIndex] || null;

          return (
            <div className="flex-grow flex flex-col w-full bg-brand-off-white dark:bg-gray-900 px-2">
                {/* Card Container */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-300 dark:border-gray-700 mb-2">
                    {/* Header with title and aspect ratio controls */}
                    <div className="flex items-center justify-between py-3 px-4">
                        <h3 className="text-md font-bold text-gray-900 dark:text-white">Match Up</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAspectRatio('1/1.2')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    aspectRatio === '1/1.2'
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                                title="Square (1:1.2)"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <rect x="4" y="4" width="16" height="16" rx="3"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => setAspectRatio('1/1.5')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    aspectRatio === '1/1.5'
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                                title="Portrait (1:1.5)"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <rect x="6" y="3" width="12" height="18" rx="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Matchup Image Preview Area */}
                    <div className="relative w-full" style={{ aspectRatio }}>
                        {/* Left contestant */}
                        {renderMatchupContestant(leftIndex, leftContestant, 'A', !!rightContestant)}
                        {/* Right contestant */}
                        {rightContestant && renderMatchupContestant(rightIndex, rightContestant, 'B')}
                        
                        {/* VS Separator */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 left-[-3px]">
                            <div 
                                className="absolute h-full w-[6px] bg-gradient-to-b from-black via-white/80 to-black"
                                style={{ transform: 'rotate(-2deg)' }}
                            />
                            <img 
                                src="/img/vs.svg" 
                                alt="VS" 
                                className="w-12 h-auto drop-shadow-lg"
                            />
                        </div>
                    </div>
                    
                    {/* Buttons at bottom of card */}
                    <div className="grid grid-cols-2 gap-4 px-4 py-6">
                        <div className="flex flex-row gap-2 justify-start">
                            <button 
                                onClick={() => handleUploadImageClick(leftIndex)} 
                                className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2"
                            >
                                <LuImage className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleSelectImageClick(leftIndex)} 
                                className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2"
                            >
                                <TbPhotoSearch className="w-4 h-4" />
                            </button>
                        </div>
                        {rightContestant && (
                            <div className="flex flex-row gap-2 justify-end">
                                <button 
                                    onClick={() => handleUploadImageClick(rightIndex)} 
                                    className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2"
                                >
                                    <LuImage className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleSelectImageClick(rightIndex)} 
                                    className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2"
                                >
                                    <TbPhotoSearch className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Instagram-style Carousel Indicator */}
                <div className="flex items-center justify-center pb-6">
                    <div 
                        className="relative overflow-hidden rounded-2xl border-2 border-[#BECC86] bg-brand-lime px-2"
                        style={{ maxWidth: '120px' }}
                    >
                        <div 
                            className="flex items-center justify-center gap-1.5 transition-transform duration-300 ease-out"
                            style={{ 
                                transform: `translateX(${(() => {
                                    const maxVisibleDots = 5;
                                    const dotWidth = 6;
                                    const gap = 6;
                                    
                                    if (totalPairs <= maxVisibleDots) return 0;
                                    
                                    const centerIndex = 2;
                                    let offset = 0;
                                    
                                    if (currentPairIndex <= centerIndex) {
                                        offset = 0;
                                    } else if (currentPairIndex >= totalPairs - centerIndex - 1) {
                                        offset = -((totalPairs - maxVisibleDots) * (dotWidth + gap));
                                    } else {
                                        offset = -((currentPairIndex - centerIndex) * (dotWidth + gap));
                                    }
                                    
                                    return offset;
                                })()}px)`
                            }}
                        >
                            {Array.from({ length: totalPairs }).map((_, idx) => {
                                const isActive = idx === currentPairIndex;
                                const distance = Math.abs(idx - currentPairIndex);
                                const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : distance === 2 ? 0.75 : 0.6;
                                const opacity = distance <= 2 ? 1 : 0.5;
                                
                                return isActive ? (
                                    <div 
                                        key={idx}
                                        className="rounded-xl p-0.5 flex-shrink-0"
                                    >
                                        <button
                                            onClick={() => setCurrentPairIndex(idx)}
                                            className="w-7 h-3 rounded-xl bg-zinc-600 transition-all duration-300"
                                            title={`Pair ${idx + 1}`}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPairIndex(idx)}
                                        className="w-4 h-4 rounded-xl bg-[#BECC86] transition-all duration-300 flex-shrink-0"
                                        style={{ 
                                            transform: `scale(${scale})`,
                                            opacity 
                                        }}
                                        title={`Pair ${idx + 1}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
          );
        }
        
        // Classic view
        return (
            <div className="flex-grow flex flex-col w-full bg-brand-off-white dark:bg-gray-900 px-2">
                {/* Card Container */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-300 dark:border-gray-700">
                    {/* Header with title and aspect ratio controls */}
                    <div className="flex items-center justify-between py-3 px-4">
                        <h3 className="text-md font-bold text-gray-900 dark:text-white">Classic</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAspectRatio('1/1.2')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    aspectRatio === '1/1.2'
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                                title="Square (1:1.2)"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <rect x="4" y="4" width="16" height="16" rx="3"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => setAspectRatio('1/1.5')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    aspectRatio === '1/1.5'
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                                title="Portrait (1:1.5)"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <rect x="6" y="3" width="12" height="18" rx="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Image Preview Area */}
                    <div className="relative w-full" style={{ aspectRatio }}>
                        {[
                            { target: 'A', name: classicDetails.optionA_name, image: images.A, loading: loadingImages.A },
                            { target: 'B', name: classicDetails.optionB_name, image: images.B, loading: loadingImages.B }
                        ].map(opt => (
                            <div 
                                key={opt.target} 
                                className="absolute inset-0 w-[52%] h-full flex flex-col items-center justify-center"
                                style={{ 
                                    backgroundColor: opt.image ? backgroundColors[opt.target as 'A' | 'B'] : (opt.target === 'A' ? '#2c2c2c' : '#f5f5f5'),
                                    clipPath: opt.target === 'A' 
                                        ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' 
                                        : 'polygon(0% 0%, 100% 0%, 100% 100%, 7% 100%)',
                                    transformOrigin: 'center center',
                                    marginLeft: opt.target === 'B' ? 'auto' : '0',
                                }}
                            >
                                {opt.image ? (
                                    <>
                                        <div 
                                            className="absolute inset-0"
                                            style={{ transform: `rotate(${rotations[opt.target as 'A' | 'B']}deg)` }}
                                        >
                                            <InteractiveImage
                                                src={opt.image}
                                                alt={opt.name}
                                                containerClassName="absolute inset-0"
                                                initialTransform={imageTransforms[opt.target as 'A' | 'B']}
                                                onTransformChange={(transform) => handleImageTransformChange(opt.target as 'A' | 'B', transform)}
                                                showControls={true}
                                                cropMode={cropModeActive[opt.target as 'A' | 'B']}
                                                onCropConfirm={(croppedUrl) => handleCropConfirm(opt.target as 'A' | 'B', croppedUrl)}
                                                onCropCancel={() => handleCropCancel(opt.target as 'A' | 'B')}
                                            />
                                        </div>
                                        
                                        {/* Inline editing controls */}
                                        <div className={`absolute bottom-3 ${opt.target === 'A' ? 'left-3' : 'right-3'} flex gap-2 z-40`}>
                                            {/* Crop button */}
                                            <button
                                                onClick={() => handleToggleCrop(opt.target as 'A' | 'B')}
                                                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                                                    cropModeActive[opt.target as 'A' | 'B']
                                                        ? 'bg-brand-lime text-black'
                                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                title="Crop"
                                            >
                                                <TbCrop className="w-5 h-5" />
                                            </button>
                                            
                                            {/* Background color button */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => handleToggleColorPicker(opt.target as 'A' | 'B')}
                                                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                                                    title="Background Color"
                                                >
                                                    <TbPalette className="w-5 h-5 text-gray-900 dark:text-white" />
                                                </button>
                                                
                                                {/* Color picker popup */}
                                                {showColorPicker[opt.target as 'A' | 'B'] && (
                                                    <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-xl z-50 min-w-[180px]">
                                                        <input
                                                            type="color"
                                                            value={backgroundColors[opt.target as 'A' | 'B']}
                                                            onChange={(e) => handleBackgroundColorChange(opt.target as 'A' | 'B', e.target.value)}
                                                            className="w-full h-10 rounded-lg cursor-pointer"
                                                        />
                                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                                            {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map(color => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => handleBackgroundColorChange(opt.target as 'A' | 'B', color)}
                                                                    className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                                                    style={{ backgroundColor: color }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Rotate button */}
                                            <button
                                                onClick={() => handleRotate(opt.target as 'A' | 'B')}
                                                className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                                                title="Rotate"
                                            >
                                                <TbRotateClockwise className="w-5 h-5 text-gray-900 dark:text-white" />
                                            </button>
                                        </div>
                                    </>
                                ) : opt.loading ? (
                                    <div className="flex items-center justify-center h-full"> <Spinner /> </div>
                                ) : (
                                    <button 
                                        onClick={() => handleUploadImageClick(opt.target as 'A' | 'B')}
                                        className="w-full h-full flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        <LuImage className={`w-9 h-9 mx-auto mb-2 ${opt.target === 'A' ? 'text-white' : 'text-gray-400'}`} />
                                        <p className={`font-semibold text-base ${opt.target === 'A' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{opt.name}</p>
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        {/* VS Separator */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 left-[-3px]">
                            <div 
                                className="absolute h-full w-[6px] bg-gradient-to-b from-black via-white/80 to-black"
                                style={{ transform: 'rotate(-2deg)' }}
                            />
                            <img 
                                src="/img/vs.svg" 
                                alt="VS" 
                                className="w-12 h-auto drop-shadow-lg"
                            />
                        </div>
                    </div>
                    
                    {/* Buttons at bottom of card */}
                    <div className="grid grid-cols-2 gap-4 px-4 py-6">
                        <div className="flex flex-row gap-2 justify-start">
                            <button 
                                onClick={() => handleUploadImageClick('A')} 
                                className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={loadingImages.A}
                            >
                                <LuImage className="w-4 h-4" />
                                {/* Upload */}
                            </button>
                            <button 
                                onClick={() => handleSelectImageClick('A')} 
                                className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={loadingImages.A}
                            >
                                <TbPhotoSearch className="w-4 h-4" />
                                {/* Select */}
                            </button>
                        </div>
                        <div className="flex flex-row gap-2 justify-end">
                            <button 
                                onClick={() => handleUploadImageClick('B')} 
                                className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={loadingImages.B}
                            >
                                <LuImage className="w-4 h-4" />
                                {/* Upload */}
                            </button>
                            <button 
                                onClick={() => handleSelectImageClick('B')} 
                                className="w-auto bg-gray-900 dark:bg-white text-white dark:text-black py-3 px-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={loadingImages.B}
                            >
                                <TbPhotoSearch className="w-4 h-4" />
                                {/* Select */}
                            </button>
                        </div>
                    </div>
                    {/* Title and subtitle below card */}
                    {/* <div className="p-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                            {classicDetails.title || 'Title goes here'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {classicDetails.optionA_name} vs {classicDetails.optionB_name}
                        </p>
                    </div> */}
                </div>
                
                
            </div>
        );
    }
  };

  const getButtonText = () => {
    if (isProcessing) return <Spinner />;
    if (step === 'images') return 'Post';
    return 'Next';
    // return (
    //   <>
    //     Next
    //     <HiArrowLongRight className="w-5 h-5 ml-1" />
    //   </>
    // );
  }

  const getHeaderTitle = () => {
    switch(step) {
      case 'type_choice': return 'Choose Battle Type';
      case 'details': return 'Create Battle';
      case 'images': return 'Add Images';
      default: return '';
    }
  }

  return (
     <div className="fixed inset-0 bg-brand-off-white dark:bg-gray-900 z-50 flex flex-col">
        <header className="flex items-center justify-between px-6 py-6 flex-shrink-0">
            <button onClick={step === 'type_choice' ? onClose : handleBack} className="text-gray-800 dark:text-gray-200">
                <RiArrowLeftLine className="w-7 h-7"/>
            </button>
            
            <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`font-semibold py-2.5 px-6 rounded-2xl transition-colors flex items-center justify-center min-w-[80px] 
                  ${step === 'type_choice' ? 'invisible' : ''} 
                  ${isNextDisabled() ? 'bg-transparent border border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-brand-lime border-2 border-[#BECC86] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                {getButtonText()}
            </button>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center">
            {renderStep()}
        </main>
        <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept="image/*" />
        
        {showImageModal && (
          <ImageSelectionModal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            onSelectImage={handleImageSelected}
            searchQuery={imageModalTarget === 'A' ? classicDetails.optionA_name : classicDetails.optionB_name}
            title={`Select Image for ${imageModalTarget === 'A' ? classicDetails.optionA_name : classicDetails.optionB_name}`}
          />
        )}
    </div>
  )
};

interface CreateViewProps {
  posts: VsPost[];
  editPost?: VsPost | null;
  onBack: () => void;
  onCreateWithAI: (topic: string) => Promise<void>;
  onCreateClassic: (postData: Omit<VsPost, 'id' | 'userVote' | 'author' | 'comments' | 'topic' | 'type'>) => void;
  onCreateMatchUp: (title: string, challengers: string[]) => Promise<void>;
}

const CreateView: React.FC<CreateViewProps> = ({ posts, editPost, onBack, onCreateWithAI, onCreateClassic, onCreateMatchUp }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'idle' | 'wizard'>('idle');

  const popularTopics = ["Superhero Movies", "Fast Food Chains", "Video Game Consoles"];

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      await onCreateWithAI(topic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
  };
  
  // If editing, go straight to wizard
  if (mode === 'wizard' || editPost) {
    return <CreationWizard posts={posts} editPost={editPost} onClose={() => setMode('idle')} onCreateClassic={onCreateClassic} onCreateMatchUp={onCreateMatchUp}/>
  }

  return (
    <div className="h-[100vh] flex flex-col bg-brand-off-white dark:bg-gray-900 relative px-6">
      <button onClick={onBack} className="absolute top-8 left-6 text-gray-800 dark:text-gray-200 p-0 z-10">
          <RiArrowLeftLine className="w-7 h-7" />
      </button>

      <div className="flex-grow flex flex-col justify-between py-20">
          <div className="mt-12">
              <h2 className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-[1.1]">
                  Create your battle and let People decide who the winner is
              </h2>
          </div>

          {/* AI Section Commented Out */}
          {/* <div 
            className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-[0_10px_30px_-5px_rgba(212,255,0,0.1),_0_0_20px_rgba(212,255,0,0.05)] border border-yellow-300/30 dark:border-brand-lime/20"
          >
               <div className="flex items-center gap-3 justify-center mb-6">
                  <RiMagicLine className="w-7 h-7 text-yellow-400 dark:text-brand-lime" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Generate with AI</h3>
              </div>
              <form onSubmit={handleAISubmit}>
                  <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., '80s Rock Bands'"
                      className="w-full bg-gray-100 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-4 text-center text-base focus:ring-2 focus:ring-yellow-400/50 dark:focus:ring-brand-lime/50 focus:border-yellow-400 dark:focus:border-brand-lime outline-none transition-all"
                      disabled={isLoading}
                  />
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {popularTopics.map(t => (
                          <button key={t} type="button" onClick={() => handleTopicClick(t)} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors" disabled={isLoading}>{t}</button>
                      ))}
                  </div>
                  <button
                      type="submit"
                      className="w-full mt-6 bg-gray-800 hover:bg-black dark:bg-gray-300 dark:hover:bg-white disabled:bg-gray-400 disabled:cursor-not-allowed text-white dark:text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.03]"
                      disabled={!topic.trim() || isLoading}
                  >
                      {isLoading ? <Spinner /> : <span>Generate</span>}
                  </button>
              </form>
              {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          </div> */}

          <div className="w-full">
               <button 
                  onClick={() => setMode('wizard')} 
                  className="w-full text-lg bg-brand-lime border-2 border-[#BECC86] hover:bg-brand-lime/90 text-zinc-800 dark:text-zinc-200 font-bold p-5 rounded-3xl transition-all text-left"
               >
                  Create my own
               </button>
          </div>
      </div>
    </div>
  );
};

export default CreateView;