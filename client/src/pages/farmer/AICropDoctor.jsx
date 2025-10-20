import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { aiAPI } from '../../services/api';

const AICropDoctor = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      alert(t('aiDoctor.selectImageFirst'));
      return;
    }
    try {
      setAnalyzing(true);
      const response = await aiAPI.analyzeCrop(selectedImage, language);
      setResult(response);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert(t('aiDoctor.analysisFailed'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTryAgain = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('aiDoctor.title')}</h1>
        <p className="text-gray-600">{t('aiDoctor.subtitle')}</p>
      </div>

      {!result ? (
        /* Upload Section */
        <div className="card space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {previewUrl ? (
              <div className="space-y-4">
                <img src={previewUrl} alt="Crop preview" className="max-h-96 mx-auto rounded-lg shadow-lg" />
                <div className="flex justify-center space-x-4">
                  <label className="btn btn-outline cursor-pointer">
                    {t('aiDoctor.changeImage')}
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-lg font-medium text-gray-900 mb-2">{t('aiDoctor.uploadImage')}</p>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <span className="btn btn-primary mt-2">{t('aiDoctor.selectImage')}</span>
              </label>
            )}
          </div>

          {previewUrl && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full btn btn-primary py-4 text-lg"
            >
              {analyzing ? `${t('aiDoctor.analyzing')}...` : t('aiDoctor.analyzeCrop')}
            </button>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 {t('aiDoctor.tip')}:</strong> {t('aiDoctor.takeClearPhoto')}
            </p>
          </div>
        </div>
      ) : (
        /* Result Section */
        <div className="space-y-6">
          {/* Image & Status */}
          <div className="card grid md:grid-cols-2 gap-6">
            <img src={previewUrl} alt="Analyzed crop" className="w-full rounded-lg shadow-lg" />
            <div className="flex flex-col justify-center text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
              <div className="text-5xl mb-3">{result.isHealthy ? '✅' : '⚠️'}</div>
              <h2 className="text-2xl font-bold mb-2">{result.disease}</h2>
              <p>
                {t('aiDoctor.confidence')}: <strong>{result.confidence}%</strong>
              </p>
            </div>
          </div>

          {/* Organic Solution */}
          {!result.isHealthy && (
            <div className="card flex items-start p-4">
              <span className="text-3xl mr-4">🌿</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{t('aiDoctor.organicSolution')}</h3>
                <p>{result.organicSolution}</p>
              </div>
            </div>
          )}

          {/* Prevention Tips */}
          <div className="card flex items-start p-4">
            <span className="text-3xl mr-4">🛡️</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{t('aiDoctor.preventionTips')}</h3>
              <ul className="list-disc list-inside">
                {result.preventionTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleTryAgain}
            className="w-full btn btn-primary py-4 text-lg"
          >
            {t('aiDoctor.tryAgain')}
          </button>
        </div>
      )}

      {/* How It Works */}
      <div className="card mt-8 bg-gray-50 p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('aiDoctor.howItWorks')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl mb-2">📸</div>
            <h4 className="font-semibold mb-1">{t('aiDoctor.step1')}</h4>
            <p className="text-sm text-gray-600">{t('aiDoctor.uploadPhoto')}</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🤖</div>
            <h4 className="font-semibold mb-1">{t('aiDoctor.step2')}</h4>
            <p className="text-sm text-gray-600">{t('aiDoctor.aiAnalysis')}</p>
          </div>
          <div>
            <div className="text-4xl mb-2">💚</div>
            <h4 className="font-semibold mb-1">{t('aiDoctor.step3')}</h4>
            <p className="text-sm text-gray-600">{t('aiDoctor.getSolutions')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICropDoctor;
