import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React from "react";
interface IDonutChartProps {
  highChartOptions?: Highcharts.Options;
}
export const DonutChart: React.FC<IDonutChartProps> = ({ highChartOptions }) => {
  const options: Highcharts.Options = {
    chart: {
      type: "pie",
      backgroundColor: "var(--menu-active)",
      plotBackgroundColor: "var(--menu-active)",
      plotBorderWidth: 0,
      plotShadow: false,
      marginBottom: 40,
    },
    title: {
      text: "",
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    accessibility: {
      enabled: false,
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        innerSize: "60%", // This creates the donut shape
        dataLabels: {
          enabled: false,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
        },
        showInLegend: true,
      },
    },
    series: [
      {
        type: "pie",
        name: "Risk",
        data: [], // pass data here
      },
    ],
    credits: {
      enabled: false,
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
      itemMarginTop: 6,
      itemMarginBottom: 6,
      x: -100,
      itemStyle: {
        fontSize: "14px",
      },
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={{ ...options, ...highChartOptions }} />;
};
