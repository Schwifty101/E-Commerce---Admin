import React from 'react';

function OrderProgress({ status }) {
  const stages = ['in_process', 'on_the_way', 'delivered'];
  const currentStageIndex = stages.indexOf(status);

  return (
    <div className="order-progress">
      {stages.map((stage, index) => (
        <React.Fragment key={stage}>
          <div className={`progress-stage ${index <= currentStageIndex ? 'active' : ''}`}>
            <div className="stage-dot"></div>
            <span className="stage-label">
              {stage === 'in_process' && 'In Process'}
              {stage === 'on_the_way' && 'On the Way'}
              {stage === 'delivered' && 'Delivered'}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div className={`progress-line ${index < currentStageIndex ? 'active' : ''}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default OrderProgress;