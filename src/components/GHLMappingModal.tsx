import { useState, useEffect } from 'react';
import './GHLMappingModal.css';

interface GHLOptions {
  contactTypes: Array<{ id: string; name: string }>;
  pipelines: Array<{
    id: string;
    name: string;
    stages: Array<{ id: string; name: string }>;
  }>;
  tags: Array<{ id: string; name: string }>;
}

interface GHLMapping {
  contactType: string;
  pipelineId: string;
  stageId: string;
  tags: string[];
}

interface GHLMappingModalProps {
  onConfirm: (mapping: GHLMapping) => void;
  onCancel: () => void;
}

export function GHLMappingModal({ onConfirm, onCancel }: GHLMappingModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<GHLOptions | null>(null);

  const [mapping, setMapping] = useState<GHLMapping>({
    contactType: 'seller',
    pipelineId: '',
    stageId: '',
    tags: []
  });

  const [selectedPipeline, setSelectedPipeline] = useState<string>('');

  useEffect(() => {
    fetchGHLOptions();
  }, []);

  const fetchGHLOptions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/getGHLOptions');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load GHL options');
      }

      setOptions(result.data);

      // Set default pipeline and stage
      if (result.data.pipelines.length > 0) {
        const defaultPipeline = result.data.pipelines[0];
        setSelectedPipeline(defaultPipeline.id);
        setMapping(prev => ({
          ...prev,
          pipelineId: defaultPipeline.id,
          stageId: defaultPipeline.stages[0]?.id || ''
        }));
      }

    } catch (err) {
      setError(`Error loading GHL options: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    const pipeline = options?.pipelines.find(p => p.id === pipelineId);
    setMapping(prev => ({
      ...prev,
      pipelineId,
      stageId: pipeline?.stages[0]?.id || ''
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setMapping(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleConfirm = () => {
    if (!mapping.contactType || !mapping.pipelineId || !mapping.stageId) {
      setError('Please select Contact Type, Pipeline, and Stage');
      return;
    }
    onConfirm(mapping);
  };

  const selectedPipelineData = options?.pipelines.find(p => p.id === selectedPipeline);

  return (
    <div className="modal-overlay">
      <div className="modal-content ghl-mapping-modal">
        <h2>Map to GoHighLevel</h2>
        <p className="modal-description">
          Select default values for GHL fields. These will be applied to all contacts in this export.
        </p>

        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading GHL options...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!isLoading && options && (
          <div className="ghl-mapping-form">
            {/* Contact Type */}
            <div className="form-group">
              <label htmlFor="contactType">
                Contact Type <span className="required">*</span>
              </label>
              <select
                id="contactType"
                value={mapping.contactType}
                onChange={(e) => setMapping({ ...mapping, contactType: e.target.value })}
                className="form-select"
              >
                {options.contactTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="info-box">
              <strong>Note:</strong> Opportunity Name will automatically use the Property Address from each record.
            </div>

            {/* Pipeline */}
            <div className="form-group">
              <label htmlFor="pipeline">
                Pipeline <span className="required">*</span>
              </label>
              <select
                id="pipeline"
                value={selectedPipeline}
                onChange={(e) => handlePipelineChange(e.target.value)}
                className="form-select"
              >
                {options.pipelines.map(pipeline => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage (dependent on pipeline) */}
            <div className="form-group">
              <label htmlFor="stage">
                Stage <span className="required">*</span>
              </label>
              <select
                id="stage"
                value={mapping.stageId}
                onChange={(e) => setMapping({ ...mapping, stageId: e.target.value })}
                className="form-select"
                disabled={!selectedPipelineData}
              >
                {selectedPipelineData?.stages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Tags (Optional)</label>
              <div className="tags-list">
                {options.tags.length === 0 ? (
                  <p className="no-tags">No tags available in your GHL account</p>
                ) : (
                  options.tags.map(tag => (
                    <label key={tag.id} className="tag-checkbox">
                      <input
                        type="checkbox"
                        checked={mapping.tags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                      />
                      <span>{tag.name}</span>
                    </label>
                  ))
                )}
              </div>
              <small className="form-hint">
                Note: PropScrub will also add 'propscrub-import' tag automatically
              </small>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onCancel} className="button-secondary">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="button-primary"
            disabled={isLoading || !options}
          >
            Confirm Mapping
          </button>
        </div>
      </div>
    </div>
  );
}
