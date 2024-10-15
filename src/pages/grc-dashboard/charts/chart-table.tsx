import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { useRef } from "react";
import { DepartmentTeamType } from "src/pages/grc-dashboard/grc-dashboard.model";
import "./charts.scss";

interface BarChartProps {
  data?: DepartmentTeamType[];
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data = [], height = 300 }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const totalCount = data.reduce(
    (accumulator, currentValue) => accumulator + currentValue.count,
    0,
  );

  const highestPercentage = data.reduce((max, d) => {
    const percentage = (d.count / totalCount) * 100;
    return percentage > max ? percentage : max;
  }, 0);

  const yAxisMax = highestPercentage + 5;

  const options: Highcharts.Options = {
    accessibility: {
      enabled: false,
    },
    chart: {
      type: "column",
      height,
      className: "highcharts-container",
      backgroundColor: "var(--menu-active)",
      plotBackgroundColor: "var(--menu-active)",
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: data.map((d: any) => d.teamName),
      lineColor: "#666", // Set the xAxis bottom line color
      lineWidth: 1, // Set the xAxis bottom line width
      visible: true,
    },
    yAxis: {
      title: {
        text: "",
      },
      labels: {
        enabled: true, // Hide yAxis labels
      },
      gridLineWidth: 0, // Remove vertical grid lines
      gridLineColor: "transparent", // Set the grid line color to transparent
      max: yAxisMax,
    },
    credits: {
      enabled: false, // Disable Highcharts.com link
    },
    // Enable  below code to use custom tooltip
    tooltip: {
      enabled: false,
      formatter: function () {
        const pointIndex = this.point.index;
        // const value = data[pointIndex].value;
        const count = data[pointIndex].count;
        return `<br/>Count: <b>${count}</b>`;
      },
    },
    plotOptions: {
      column: {
        color: "var(--logo-color)",
        showInLegend: false,
        pointPadding: 0.2, // Set pointPadding to 0
        groupPadding: 0.3, // Set groupPadding to 0
        dataLabels: {
          enabled: true,
          format: "{y}%", // Display the y value on the column
          // inside: false, // Display the value inside the column
          // verticalAlign: "top", // Adjust the vertical alignment
          align: "center",
          style: {
            fontFamily: "var(--default-font)",
            // color: "var(--text-light-color)", // Set the text color
            color: "rgb(51, 51, 51)",
            fontSize: "0.8em",
            fill: "var(--text-light-color)",
            fontWeight: "600",
          },
          // crop: false,
          // overflow: "allow",
        },
        states: {
          hover: {
            color: "#eb4444", // Change to the desired color on hover
            opacity: 1,
          },
        },
        // borderWidth: 0, // Remove the border around the column
        // pointWidth: 20, // Set the width of the columns
        // borderColor: "#eb4444",
        borderRadius: 12,
      },
    },
    series: [
      {
        type: "column",
        name: "",
        data: (() => {
          const percentages = data.map((d) => (d.count / totalCount) * 100);
          const integerParts = percentages.map(Math.floor);
          const sumOfIntegerParts = integerParts.reduce((acc, curr) => acc + curr, 0);
          const remainder = 100 - sumOfIntegerParts;
          const fractionalParts = percentages.map((p, index) => ({
            fraction: p - Math.floor(p),
            index,
          }));
          fractionalParts.sort((a, b) => b.fraction - a.fraction);
          const finalPercentages = [...integerParts];
          for (let i = 0; i < remainder; i++) {
            finalPercentages[fractionalParts[i].index]++;
          }
          return finalPercentages;
        })(),
      },
    ],
  };

  return (
    <div ref={chartRef}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default BarChart;
