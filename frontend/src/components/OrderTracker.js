import React from 'react';

const OrderTracker = ({ currentStage, orderStages, timeElapsed }) => {
  const getStageTime = (stageIndex) => {
    const times = [0, 3, 8, 13, 23]; // Corresponding to stage times
    return times[stageIndex] || 0;
  };

  return (
    <div className="order-tracker">
      <h2>Order Status</h2>
      <div className="tracker-timeline">
        {orderStages.map((stage, index) => {
          const isCompleted = index <= currentStage;
          const isCurrent = index === currentStage;
          const stageTime = getStageTime(index);
          
          return (
            <div 
              key={stage.id} 
              className={`tracker-stage ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="stage-header">
                <div className="stage-icon-wrapper">
                  <div className="stage-icon">
                    {isCompleted ? '✅' : isCurrent ? '🔄' : stage.icon}
                  </div>
                  {index < orderStages.length - 1 && (
                    <div className={`connector ${isCompleted ? 'completed' : ''}`}></div>
                  )}
                </div>
                <div className="stage-info">
                  <h4>{stage.name}</h4>
                  <p>{stage.description}</p>
                  <span className="stage-time">{stage.time}</span>
                  {isCurrent && timeElapsed >= stageTime && (
                    <div className="current-status">
                      <div className="pulse-dot"></div>
                      <span>In progress...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {isCurrent && (
                <div className="stage-progress">
                  <div className="mini-progress">
                    <div 
                      className="mini-progress-bar" 
                      style={{ 
                        width: `${Math.min(((timeElapsed - stageTime) / 5) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="delivery-estimate">
        <div className="estimate-card">
          <h3>📦 Delivery Estimate</h3>
          <p className="estimate-time">20-25 minutes total</p>
          <div className="time-breakdown">
            <div className="time-item">
              <span>Preparation:</span>
              <span>8-10 min</span>
            </div>
            <div className="time-item">
              <span>Delivery:</span>
              <span>12-15 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;