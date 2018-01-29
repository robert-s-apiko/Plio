import React from 'react';
import PropTypes from 'prop-types';
import {
  VictoryChart,
  VictoryZoomContainer,
  VictoryAxis,
  VictoryLine,
  VictoryLabel,
  VictoryScatter,
  VictoryTooltip,
} from 'victory';

const fontFamily = '"Roboto", "Helvetica Neue", Helvetica, sans-serif';

const getLineData = ({
  startDate,
  endDate,
  title,
  milestones = [],
}, y) => [
  { x: new Date(startDate), y, label: title },
  { x: new Date(endDate), y },
  ...milestones.map(({ completionTargetDate }) => ({
    y,
    x: new Date(completionTargetDate),
  })),
];

const getScatterData = ({
  title,
  startDate,
  endDate,
  color,
  milestones = [],
}, y) => [
  {
    y,
    x: new Date(startDate),
    label: `${title} \n start date: \n ${new Date(startDate).toDateString()}`,
    symbol: 'circle',
    strokeWidth: 7,
    fill: color,
  },
  {
    y,
    x: new Date(endDate),
    label: `${title} \n end date: \n ${new Date(endDate).toDateString()}`,
    symbol: 'circle',
    strokeWidth: 7,
    fill: color,
  },
  ...milestones.map(({ completionTargetDate, title: milestoneTitle }) => ({
    y,
    x: new Date(completionTargetDate),
    label: milestoneTitle,
    symbol: 'square',
    strokeWidth: 3,
    size: 5,
    fill: color,
  })),
];

const GoalsChart = ({
  goals,
  zoomDomain,
  onZoom,
  onLineTap,
  onScatterTap,
}) => (
  <VictoryChart
    width={1140}
    height={400}
    scale={{ x: 'time' }}
    domainPadding={{ x: [20, 20] }}
    domain={{
      x: [
        new Date('01 January 2018'),
        new Date('01 January 2019'),
      ],
      y: [
        -1,
        goals.length,
      ],
    }}
    containerComponent={(
      <VictoryZoomContainer
        dimension="x"
        zoomDomain={zoomDomain}
        onDomainChange={onZoom}
      />
    )}
    padding={{
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
  >
    <VictoryAxis
      style={{
        axis: {
          stroke: 'none',
        },
        tickLabels: {
          angle: 0,
          padding: 30,
          border: 1,
          fontFamily,
        },
      }}
    />
    <VictoryLine
      style={{
        data: { stroke: '#888', strokeWidth: 1, fontFamily },
        labels: { fill: '#888' },
      }}
      data={[
        { x: new Date(), y: 0, label: 'today' },
        { x: new Date(), y: 400 },
      ]}
      labelComponent={<VictoryLabel dy={35} />}
    />
    {goals.map((goal, index) => (
      <VictoryLine
        key={goal._id}
        animate={{ duration: 500 }}
        style={{
          data: {
            stroke: goal.color,
            strokeWidth: 4,
            cursor: 'pointer',
          },
          labels: {
            fontFamily,
            fill: '#888',
            fontWeight: 'lighter',
            textAnchor: 'start',
          },
        }}
        events={[{
          target: 'data',
          eventHandlers: {
            onClick: e => onLineTap(e, goal),
          },
        }]}
        data={getLineData(goal, index)}
        labelComponent={<VictoryLabel x={450} />}
      />
    ))}
    {goals.map((goal, index) => (
      <VictoryScatter
        key={goal._id}
        style={{
          data: {
            stroke: goal.color,
            cursor: 'pointer',
          },
          labels: { fontFamily },
        }}
        events={[{
          target: 'data',
          eventHandlers: {
            onClick: onScatterTap,
          },
        }]}
        data={getScatterData(goal, index)}
        labelComponent={<VictoryTooltip />}
      />
    ))}
  </VictoryChart>
);

GoalsChart.propTypes = {
  goals: PropTypes.arrayOf(PropTypes.object).isRequired,
  zoomDomain: PropTypes.object,
  onZoom: PropTypes.func,
  onLineTap: PropTypes.func,
  onScatterTap: PropTypes.func,
};

export default GoalsChart;
