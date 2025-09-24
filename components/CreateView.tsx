import React, { useState, useRef, useEffect } from 'react';
import { RiArrowLeftLine, RiMagicLine, RiAddLine, RiCloseLine, RiMicLine, RiEditLine, RiUploadLine } from 'react-icons/ri';
import Spinner from './common/Spinner';
import { generateImage } from '../services/geminiService';
import ImageSelectionModal from './common/ImageSelectionModal';
import ImageEditor from './common/ImageEditor';
import InteractiveImage from './common/InteractiveImage';
import type { VsPost } from '../types';
import { LuImage } from 'react-icons/lu';

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
  onClose: () => void;
  onCreateClassic: (postData: Omit<VsPost, 'id' | 'userVote' | 'author' | 'comments' | 'topic' | 'type'>) => void;
  onCreateMatchUp: (title: string, challengers: string[]) => Promise<void>;
}

const CreationWizard: React.FC<CreationWizardProps> = ({ posts, onClose, onCreateClassic, onCreateMatchUp }) => {
  const [step, setStep] = useState<WizardStep>('type_choice');
  const [creationType, setCreationType] = useState<CreationType>('classic');
  const [isProcessing, setIsProcessing] = useState(false);

  // Classic state
  const [classicDetails, setClassicDetails] = useState({ title: '', optionA_name: '', optionB_name: '' });
  const [images, setImages] = useState<{ A: string | null, B: string | null }>({ A: null, B: null });
  const [loadingImages, setLoadingImages] = useState<{ A: boolean, B: boolean }>({ A: false, B: false });
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [backgroundColors, setBackgroundColors] = useState<{ A: string, B: string }>({ A: '#000000', B: '#000000' });
  const [aspectRatio, setAspectRatio] = useState<'1/1' | '1/1.3'>('1/1.3');
  const [imageTransforms, setImageTransforms] = useState<{ A: any, B: any }>({ 
    A: { scale: 1, translateX: 0, translateY: 0, objectFit: 'cover' },
    B: { scale: 1, translateX: 0, translateY: 0, objectFit: 'cover' }
  });
  
  // Match-up state
  const [matchUpDetails, setMatchUpDetails] = useState({ title: '', challengers: '' });

  // Voice Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageTarget, setImageTarget] = useState<'A' | 'B' | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTarget, setImageModalTarget] = useState<'A' | 'B' | null>(null);
  
  // Image editor state
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageEditorTarget, setImageEditorTarget] = useState<'A' | 'B' | null>(null);
  const [imageEditorUrl, setImageEditorUrl] = useState<string>('');
  
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


  const checkForDuplicates = (nameA: string, nameB: string): boolean => {
    const formattedA = nameA.trim().toLowerCase();
    const formattedB = nameB.trim().toLowerCase();

    return posts.some(post => {
        if (post.type !== 'classic' || !post.optionA || !post.optionB) return false;

        const existingA = post.optionA.name.trim().toLowerCase();
        const existingB = post.optionB.name.trim().toLowerCase();

        return (
            (formattedA === existingA && formattedB === existingB) ||
            (formattedA === existingB && formattedB === existingA)
        );
    });
  };

  const handleNext = async () => {
    if (step === 'details') {
      if (creationType === 'classic') {
        if (checkForDuplicates(classicDetails.optionA_name, classicDetails.optionB_name)) {
            setDuplicateError('This matchup already exists. Please create a different one.');
            return;
        }
        setStep('images');
      } else {
        // Post Match Up
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
        return !classicDetails.optionA_name.trim() || !classicDetails.optionB_name.trim() || !!duplicateError;
      }
      const challengers = matchUpDetails.challengers.split(',').map(c => c.trim()).filter(Boolean);
      return !matchUpDetails.title.trim() || challengers.length < 8 || challengers.length > 30;
    }
    if (step === 'images') {
      return !images.A || !images.B || loadingImages.A || loadingImages.B;
    }
    return false;
  };

  const handleUploadImageClick = (target: 'A' | 'B') => {
    setImageTarget(target);
    fileInputRef.current?.click();
  };

  const handleSelectImageClick = (target: 'A' | 'B') => {
    setImageModalTarget(target);
    setShowImageModal(true);
  };

  const handleEditImageClick = (target: 'A' | 'B') => {
    const imageUrl = images[target];
    if (imageUrl) {
      setImageEditorTarget(target);
      setImageEditorUrl(imageUrl);
      setShowImageEditor(true);
    }
  };

  const handleImageEditorSave = (editedImageUrl: string, backgroundColor?: string) => {
    if (imageEditorTarget) {
      setImages(prev => ({ ...prev, [imageEditorTarget]: editedImageUrl }));
      if (backgroundColor) {
        setBackgroundColors(prev => ({ ...prev, [imageEditorTarget]: backgroundColor }));
      }
    }
    setShowImageEditor(false);
    setImageEditorTarget(null);
    setImageEditorUrl('');
  };

  const handleImageTransformChange = (target: 'A' | 'B', transform: any) => {
    setImageTransforms(prev => ({ ...prev, [target]: transform }));
  };

  const handleImageSelected = (imageUrl: string) => {
    if (imageModalTarget) {
      setImages(prev => ({ ...prev, [imageModalTarget]: imageUrl }));
    }
    setShowImageModal(false);
    setImageModalTarget(null);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const renderStep = () => {
    switch (step) {
      case 'type_choice':
        return (
          <div className="text-center p-8">
            <div className="space-y-4">
               <button onClick={() => handleTypeSelect('classic')} className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all transform">
                  <h3 className="text-xl font-bold dark:text-white text-gray-900">Classic</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">One-on-one vote between two contenders.</p>
               </button>
               <button onClick={() => handleTypeSelect('match-up')} className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all transform">
                   <h3 className="text-xl font-bold dark:text-white text-gray-900">Match Up</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A series of rounds to find the ultimate winner.</p>
                </button>
            </div>
          </div>
        );
      case 'details':
        if (creationType === 'classic') {
          return (
            <div className="p-8 w-full max-w-lg mx-auto">
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Add an optional caption for your VS battle.</p>
              <input
                  type="text"
                  placeholder="Optional: Add a caption or leave blank"
                  value={classicDetails.title}
                  onChange={e => setClassicDetails(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-center text-lg bg-transparent border-b-2 dark:border-gray-600 border-gray-300 dark:text-white text-gray-900 focus:border-brand-lime focus:ring-0 outline-none p-2 mb-12 transition-colors"
              />
              <div className="flex items-center justify-center gap-4">
                  <input
                      type="text"
                      placeholder="Contender 1"
                      value={classicDetails.optionA_name}
                      onChange={e => {
                        setClassicDetails(prev => ({ ...prev, optionA_name: e.target.value }));
                        setDuplicateError(null);
                      }}
                      className="w-full text-center text-lg bg-transparent border-b-2 dark:border-gray-600 border-gray-300 dark:text-red-400 text-red-500 focus:border-red-500 focus:ring-0 outline-none p-2 transition-colors"
                  />
                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">VS</span>
                  <input
                      type="text"
                      placeholder="Contender 2"
                      value={classicDetails.optionB_name}
                      onChange={e => {
                        setClassicDetails(prev => ({ ...prev, optionB_name: e.target.value }));
                        setDuplicateError(null);
                      }}
                      className="w-full text-center text-lg bg-transparent border-b-2 dark:border-gray-600 border-gray-300 dark:text-cyan-400 text-cyan-500 focus:border-cyan-500 focus:ring-0 outline-none p-2 transition-colors"
                  />
              </div>

              {recognitionRef.current && (
                <div className="text-center mt-12">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Or say it out loud (e.g. "Coke vs Pepsi")</p>
                  <button
                      type="button"
                      onClick={handleToggleListening}
                      className={`p-4 rounded-full transition-all duration-300 inline-flex items-center justify-center ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                      <RiMicLine className="w-6 h-6" />
                  </button>
                  {isListening && <p className="text-sm text-red-500 dark:text-red-400 mt-2 animate-pulse">Listening...</p>}
                </div>
              )}

              {duplicateError && <p className="text-red-500 text-center mt-4">{duplicateError}</p>}
            </div>
          );
        } else { // Match Up
          return (
            <div className="p-8 w-full max-w-lg mx-auto">
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Enter a title and a list of competitors.</p>
              <input
                  type="text"
                  placeholder="Title, e.g., 'Greatest NBA Players'"
                  value={matchUpDetails.title}
                  onChange={e => setMatchUpDetails(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-lg bg-transparent border-b-2 dark:border-gray-600 border-gray-300 dark:text-white text-gray-900 focus:border-brand-lime focus:ring-0 outline-none p-2 mb-8 transition-colors"
              />
              <textarea
                  placeholder="Enter 8 to 30 names, separated by commas... e.g., Jordan, LeBron, Kobe, Shaq..."
                  value={matchUpDetails.challengers}
                  onChange={e => setMatchUpDetails(prev => ({ ...prev, challengers: e.target.value }))}
                  className="w-full h-32 text-lg bg-transparent border-2 dark:border-gray-600 border-gray-300 dark:text-white text-gray-900 focus:border-brand-lime focus:ring-2 focus:ring-brand-lime/50 rounded-lg outline-none p-4 transition-colors"
                  rows={4}
              />
            </div>
          )
        }
      case 'images':
        return (
            <div className="flex-grow flex flex-col w-full bg-brand-off-white dark:bg-gray-900">
                <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-2">{classicDetails.optionA_name} vs {classicDetails.optionB_name}</p>
                
                {/* Aspect Ratio Controls */}
                <div className="flex justify-center mb-4">
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setAspectRatio('1/1.2')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                aspectRatio === '1/1.2'
                                    ? 'bg-brand-lime text-black'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Square (1:1.2)
                        </button>
                        <button
                            onClick={() => setAspectRatio('1/1.5')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                aspectRatio === '1/1.5'
                                    ? 'bg-brand-lime text-black'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Portrait (1:1.5)
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-center items-center w-full flex-grow">
                    <div className="relative w-full max-w-md" style={{ aspectRatio }}>
                    {[
                        { target: 'A', color: 'bg-red-500', name: classicDetails.optionA_name, image: images.A, loading: loadingImages.A },
                        { target: 'B', color: 'bg-cyan-500', name: classicDetails.optionB_name, image: images.B, loading: loadingImages.B }
                    ].map(opt => (
                        <div 
                            key={opt.target} 
                            className="absolute inset-0 w-[52%] h-full flex flex-col items-center justify-center text-white"
                            style={{ 
                                backgroundColor: opt.image ? backgroundColors[opt.target as 'A' | 'B'] : (opt.target === 'A' ? '#444' : '#ededed'),
                                clipPath: opt.target === 'A' 
                                    ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' 
                                    : 'polygon(0% 0%, 100% 0%, 100% 100%, 7% 100%)',
                                transformOrigin: 'center center',
                                marginLeft: opt.target === 'B' ? 'auto' : '0',
                            }}
                        >
                            {opt.image ? (
                                <>
                                    <InteractiveImage
                                        src={opt.image}
                                        alt={opt.name}
                                        containerClassName="absolute inset-0"
                                        initialTransform={imageTransforms[opt.target as 'A' | 'B']}
                                        onTransformChange={(transform) => handleImageTransformChange(opt.target as 'A' | 'B', transform)}
                                        showControls={true}
                                    />
                                    {/* Edit button overlay */}
                                    <button
                                        onClick={() => handleEditImageClick(opt.target as 'A' | 'B')}
                                        className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors z-30"
                                        title="Edit Image"
                                    >
                                        <RiEditLine className="w-5 h-5 text-white" />
                                    </button>
                                </>
                            ) : opt.loading ? (
                                <div className="flex items-center justify-center h-full"> <Spinner /> </div>
                            ) : (
                                <div className="text-center">
                                    <LuImage className="w-16 h-16 mx-auto opacity-80" />
                                    <p className="font-bold text-lg mt-2">{opt.name}</p>
                                </div>
                            )}
                            <div className="absolute bottom-6 left-4 right-4 space-y-3 z-10">
                                <button 
                                    onClick={() => handleSelectImageClick(opt.target as 'A' | 'B')} 
                                    className="w-full bg-black/25 backdrop-blur-sm py-3 px-4 rounded-xl hover:bg-black/40 transition-colors font-semibold text-sm disabled:opacity-50"
                                    disabled={opt.loading}
                                >
                                    <LuImage className="w-4 h-4 inline mr-2" />
                                    {opt.image ? 'Change Image' : 'Select Image'}
                                </button>
                                <button 
                                    onClick={() => handleUploadImageClick(opt.target as 'A' | 'B')} 
                                    className="w-full bg-black/25 backdrop-blur-sm py-3 px-4 rounded-xl hover:bg-black/40 transition-colors font-semibold text-sm disabled:opacity-50"
                                    disabled={opt.loading}
                                >
                                    <RiUploadLine className="w-4 h-4 inline mr-2" />
                                    Upload Image
                                </button>
                                {/* <button 
                                    onClick={() => handleGenerateImage(opt.target as 'A' | 'B')} 
                                    className="w-full bg-black/25 backdrop-blur-sm py-3 px-4 rounded-xl hover:bg-black/40 transition-colors font-semibold text-sm disabled:opacity-50"
                                    disabled={opt.loading}
                                >
                                    <RiMagicLine className="w-4 h-4 inline mr-2" />
                                    Generate with AI
                                </button> */}
                            </div>
                        </div>
                    ))}
                    
                    {/* VS Separator Image */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <img 
                            src="/img/vs-bk.svg" 
                            alt="VS" 
                            className="w-[18%] h-[104%] object-contain drop-shadow-lg"
                            onError={(e) => {
                                // Fallback to text if image doesn't exist
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                            }}
                        />
                    </div>
                </div>
                    </div>
                </div>
        );
    }
  };

  const getButtonText = () => {
    if (isProcessing) return <Spinner />;
    if (step === 'details' && creationType === 'match-up') return 'Post';
    if (step === 'images' && creationType === 'classic') return 'Post';
    return 'Next';
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
        <header className="flex items-center justify-between p-4 border-b dark:border-gray-800 border-gray-200 flex-shrink-0">
            <button onClick={step === 'type_choice' ? onClose : handleBack} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {step === 'type_choice' ? <RiCloseLine className="w-6 h-6"/> : <RiArrowLeftLine className="w-6 h-6"/>}
            </button>
            
            <h1 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{getHeaderTitle()}</h1>
            
            <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`font-bold py-2 px-5 rounded-full transition-colors flex items-center justify-center min-w-[80px] ${step === 'type_choice' ? 'invisible' : ''} ${isNextDisabled() ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black'}`}
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

        {showImageEditor && (
          <ImageEditor
            isOpen={showImageEditor}
            imageUrl={imageEditorUrl}
            onClose={() => setShowImageEditor(false)}
            onSave={handleImageEditorSave}
            title={`Edit Image for ${imageEditorTarget === 'A' ? classicDetails.optionA_name : classicDetails.optionB_name}`}
            initialBackgroundColor={imageEditorTarget ? backgroundColors[imageEditorTarget] : '#000000'}
          />
        )}
    </div>
  )
};

interface CreateViewProps {
  posts: VsPost[];
  onBack: () => void;
  onCreateWithAI: (topic: string) => Promise<void>;
  onCreateClassic: (postData: Omit<VsPost, 'id' | 'userVote' | 'author' | 'comments' | 'topic' | 'type'>) => void;
  onCreateMatchUp: (title: string, challengers: string[]) => Promise<void>;
}

const CreateView: React.FC<CreateViewProps> = ({ posts, onBack, onCreateWithAI, onCreateClassic, onCreateMatchUp }) => {
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
  
  if (mode === 'wizard') {
    return <CreationWizard posts={posts} onClose={() => setMode('idle')} onCreateClassic={onCreateClassic} onCreateMatchUp={onCreateMatchUp}/>
  }

  return (
    <div className="p-4 h-full flex flex-col bg-brand-off-white dark:bg-gray-900 relative">
      <button onClick={onBack} className="absolute top-6 left-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 z-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <RiArrowLeftLine className="w-6 h-6" />
      </button>

      <div className="flex items-center justify-center text-center my-6 flex-shrink-0">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Create Battle</h2>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-8 px-4">
          <div 
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
          </div>

          <div className="w-full max-w-md">
               <button onClick={() => setMode('wizard')} className="w-full bg-white dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500">
                  <RiAddLine className="w-5 h-5" />
                  <span>Create my own</span>
               </button>
          </div>
      </div>
    </div>
  );
};

export default CreateView;