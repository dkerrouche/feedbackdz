'use client';

import React, { useState } from 'react';
import { RealtimeResponse } from '@/types';
import { 
  X, 
  Star, 
  Clock, 
  MessageSquare, 
  Mic, 
  Flag, 
  CheckCircle, 
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Globe,
  Smartphone,
  Calendar
} from 'lucide-react';
import { updateResponse } from '@/lib/response-management'

interface ResponseDetailModalProps {
  response: RealtimeResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAddressed: (responseId: string) => void;
  onFlag: (responseId: string) => void;
  onDelete: (responseId: string) => void;
  isAddressed?: boolean;
  isFlagged?: boolean;
}

export default function ResponseDetailModal({
  response,
  isOpen,
  onClose,
  onMarkAddressed,
  onFlag,
  onDelete,
  isAddressed = false,
  isFlagged = false
}: ResponseDetailModalProps) {
  if (!isOpen || !response) return null;

  const [notes, setNotes] = useState<string>((response as any)?.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Response Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating and Sentiment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Rating:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(response.rating)}
                </div>
                <span className="text-sm text-gray-600">({response.rating}/5)</span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(response.sentiment)}`}>
                <div className="flex items-center space-x-1">
                  {getSentimentIcon(response.sentiment)}
                  <span className="capitalize">{response.sentiment}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatDateTime(response.created_at)}</span>
            </div>
          </div>

          {/* Content */}
          {response.transcription && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {response.audio_url ? (
                  <Mic className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {response.audio_url ? 'Audio Transcription' : 'Text Response'}
                  </h3>
                  <p className="text-gray-900 leading-relaxed">
                    {response.transcription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {response.audio_url && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Audio Recording</h3>
              <audio controls className="w-full">
                <source src={response.audio_url} type="audio/webm" />
                <source src={response.audio_url} type="audio/mp4" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Keywords */}
          {response.keywords && response.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {response.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details */
          }
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Response ID:</span>
                <span className="ml-2 font-mono text-gray-900">{response.id}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Language:</span>
                <span className="ml-2 text-gray-900">{response.language || 'Unknown'}</span>
              </div>
              
              <div>
                <span className="text-gray-600">IP Address:</span>
                <span className="ml-2 font-mono text-gray-900">{response.ip_address || 'N/A'}</span>
              </div>
              
              <div>
                <span className="text-gray-600">Device:</span>
                <div className="flex items-center space-x-1 mt-1">
                  {getDeviceIcon(response.user_agent || '')}
                  <span className="text-gray-900">
                    {response.user_agent?.includes('iPhone') ? 'iPhone' :
                     response.user_agent?.includes('Android') ? 'Android' :
                     response.user_agent?.includes('Windows') ? 'Windows' :
                     response.user_agent?.includes('Mac') ? 'Mac' : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Processed:</span>
                <span className="ml-2 text-gray-900">
                  {response.processed_at ? formatDateTime(response.processed_at) : 'Not processed'}
                </span>
              </div>
              
              <div>
                <span className="text-gray-600">Spam:</span>
                <span className={`ml-2 ${response.is_spam ? 'text-red-600' : 'text-green-600'}`}>
                  {response.is_spam ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Internal Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for your team (not visible to customers)"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={async () => {
                  try {
                    setSavingNotes(true)
                    await updateResponse(response.id, 'update_notes', { notes: notes?.trim() || '' })
                    setSavedAt(Date.now())
                  } finally {
                    setSavingNotes(false)
                  }
                }}
                disabled={savingNotes}
                className={`px-4 py-2 rounded-lg text-sm ${savingNotes ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
              {savedAt && (
                <span className="ml-3 text-sm text-green-600">Saved</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {!isAddressed && (
              <button
                onClick={() => {
                  onMarkAddressed(response.id);
                  onClose();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Addressed</span>
              </button>
            )}
            {isAddressed && (
              <button
                onClick={() => {
                  onMarkAddressed(response.id);
                  onClose();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Unmark Addressed</span>
              </button>
            )}
            
            <button
              onClick={() => {
                onFlag(response.id);
                onClose();
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isFlagged 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>{isFlagged ? 'Flagged' : 'Flag Response'}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
            
            <button
              onClick={() => {
                onDelete(response.id);
                onClose();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
