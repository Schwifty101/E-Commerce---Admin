import React from 'react';

function OrderProgress({ status }) {
  const stages = ['in_process', 'on_the_way', 'delivered'];
  let currentStageIndex;

  // Determine the current stage index based on the status
  if (status === 'pending' || status === 'processing') {
    currentStageIndex = 0; // in_process
  } else if (status === 'shipped') {
    currentStageIndex = 1; // on_the_way
  } else if (status === 'delivered') {
    currentStageIndex = 2; // delivered
  } else if (status === 'cancelled' || status === 'returned') {
    currentStageIndex = -1; // special case for cancelled/returned
  }

  return (
    <div className="order-progress">
      {currentStageIndex === -1 ? (
        <div className="cancelled-returned" style={{ color: 'red' }}>
          {status === 'cancelled' ? 'Cancelled' : 'Returned'}
        </div>
      ) : (
        stages.map((stage, index) => (
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
        ))
      )}
    </div>
  );
}

export default OrderProgress;