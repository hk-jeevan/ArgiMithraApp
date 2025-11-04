import React, {useState, useCallback, useRef} from 'react'
import './DiseaseDetection.css'

// Mock disease database
const MOCK_DISEASES = {
  'leaf_blight': {
    name: 'Leaf Blight',
    confidence: 0.87,
    description: 'A fungal disease that causes brown lesions on leaves',
    symptoms: [
      'Brown or black lesions on leaves',
      'Yellowing around lesions',
      'Premature leaf drop'
    ],
    treatment: [
      'Remove and destroy infected leaves',
      'Improve air circulation between plants',
      'Apply fungicide as recommended',
      'Water at soil level to keep leaves dry'
    ],
    prevention: [
      'Plant resistant varieties',
      'Maintain proper plant spacing',
      'Avoid overhead watering',
      'Practice crop rotation'
    ]
  },
  'powdery_mildew': {
    name: 'Powdery Mildew',
    confidence: 0.92,
    description: 'A fungal disease causing white powdery spots',
    symptoms: [
      'White powdery spots on leaves and stems',
      'Yellowing leaves',
      'Stunted growth'
    ],
    treatment: [
      'Apply fungicide specifically for powdery mildew',
      'Remove heavily infected plants',
      'Increase air circulation'
    ],
    prevention: [
      'Space plants properly',
      'Water in the morning',
      'Remove plant debris',
      'Use resistant varieties when possible'
    ]
  }
}

// DiseaseDetection: image upload + detection with detailed results
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export default function DiseaseDetection(){
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const fileInputRef = useRef()

  const handleFile = (f) => {
    if(!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const onChange = (e) => {
    handleFile(e.target.files?.[0])
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer?.files?.[0]
    handleFile(f)
  }, [])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const toggleZoom = () => {
    setIsZoomed(prev => !prev)
  }

  async function detect(){
    if(!file) return
    setLoading(true)
    setResult(null)
    try{
      // Create form data with the image
      const form = new FormData()
      form.append('file', file, file.name)

      console.log('Sending request to:', `${API_BASE}/disease/predict`)
      
      // Send request to backend
      const r = await fetch(`${API_BASE}/disease/predict`, {
        method: 'POST',
        body: form
      })

      if(!r.ok) {
        const errorText = await r.text()
        throw new Error(`Server returned ${r.status}: ${errorText}`)
      }

      const json = await r.json()
      console.log('Received response:', json)

      if(!json.disease || !json.confidence) {
        throw new Error('Invalid response format from server')
      }

      // Format disease name for display
      const diseaseId = json.disease
      const confidence = json.confidence
      const displayName = diseaseId.split('___')
        .map(part => part.replace(/_/g, ' '))
        .join(' - ')

      // Define disease information
      const diseaseInfo = {
        'Apple___Apple_scab': {
          symptoms: [
            'Dark olive-green spots on leaves',
            'Brown or black scab-like lesions on fruits',
            'Deformed or cracked fruits',
            'Premature leaf fall'
          ],
          treatment: [
            'Remove and destroy fallen leaves',
            'Apply fungicides early in the growing season',
            'Prune trees to improve air circulation',
            'Consider resistant apple varieties for future plantings'
          ],
          prevention: [
            'Plant disease-resistant varieties',
            'Maintain good orchard sanitation',
            'Ensure proper tree spacing for ventilation',
            'Apply preventive fungicide sprays'
          ]
        },
        'Apple___Black_rot': {
          symptoms: [
            'Purple spots on leaves',
            'Rotting fruit with black centers',
            'Cankers on branches',
            'Leaf yellowing and drop'
          ],
          treatment: [
            'Remove infected fruits and branches',
            'Apply appropriate fungicides',
            'Prune out dead or diseased wood',
            'Maintain tree vigor through proper fertilization'
          ],
          prevention: [
            'Regular pruning for good air circulation',
            'Clean up fallen fruit and leaves',
            'Avoid tree wounds',
            'Use disease-resistant varieties'
          ]
        }
      }

      // Get disease-specific information or use defaults
      const diseaseData = diseaseInfo[diseaseId] || {
        symptoms: ['Consult a local agricultural expert for specific symptoms'],
        treatment: ['Consult a local agricultural expert for treatment options'],
        prevention: ['Consult a local agricultural expert for prevention strategies']
      }

      // Create detailed result
      const result = {
        name: displayName,
        confidence: confidence,
        description: `Detected ${displayName} with ${(confidence*100).toFixed(0)}% confidence`,
        symptoms: diseaseData.symptoms,
        treatment: diseaseData.treatment,
        prevention: diseaseData.prevention
      }

      setResult({ 
        id: diseaseId, 
        ...result, 
        timestamp: new Date().toLocaleString() 
      })
    }catch(err){
      console.error('Detection error:', err)
      setResult({
        error: 'Failed to analyze image',
        details: `Please make sure the backend server is running at ${API_BASE} and try again. Error: ${err.message}`
      })
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="tool disease-tool">
      <h2>Disease Detection</h2>
      
      <div 
        className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input 
          type="file" 
          accept="image/*" 
          onChange={onChange}
          ref={fileInputRef}
        />
        <div className="placeholder">
          <div>Drag and drop an image here, or click to select</div>
          <div className="muted">Supported: JPG, PNG (max 5MB)</div>
        </div>
      </div>

      {preview && (
        <div className="preview-container">
          <img 
            src={preview} 
            alt="Plant" 
            className={isZoomed ? 'zoomed' : ''} 
            onClick={toggleZoom}
          />
        </div>
      )}

      <div className="actions">
        <button 
          onClick={detect} 
          disabled={!file || loading}
          className="primary"
        >
          {loading ? 'Analyzing Image...' : 'Detect Disease'}
        </button>
        {file && (
          <button 
            onClick={() => {
              setFile(null)
              setPreview(null)
              setResult(null)
            }}
            className="secondary"
          >
            Clear
          </button>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {result && (
        <div className="result-card">
          {result.error ? (
            <div className="error">{result.error}</div>
          ) : (
            <>
              <div className="disease-name">{result.name}</div>
              
              <div className="confidence">
                <span>Confidence: {(result.confidence*100).toFixed(0)}%</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{width: `${result.confidence*100}%`}}
                  />
                </div>
              </div>

              <p>{result.description}</p>

              <div className="advice-section">
                <h4>Symptoms</h4>
                <ul className="advice-list">
                  {result.symptoms.map((s,i) => <li key={i}>{s}</li>)}
                </ul>

                <h4>Treatment</h4>
                <ul className="advice-list">
                  {result.treatment.map((t,i) => <li key={i}>{t}</li>)}
                </ul>

                <h4>Prevention</h4>
                <ul className="advice-list">
                  {result.prevention.map((p,i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div className="muted" style={{marginTop:20}}>
                Analysis completed: {result.timestamp}
              </div>
            </>
          )}
        </div>
      )}

      <div className="note">
        Note: This tool uses a CNN model trained on plant disease datasets to provide accurate disease detection.
        The model has been trained on 38 different plant disease classes including various crops like apples, tomatoes, potatoes, and more.
      </div>
    </div>
  )
}
