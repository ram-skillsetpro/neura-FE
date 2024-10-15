import { DonutChart } from "core/components/charts/donut-chart";
// import { FrequencyDropdown } from "pages/dashboard-stats/frequency-dropdown";

interface IChartChard {
  title: string;
  data: { name: string; y: number }[];
}

export const ChartCard: React.FC<IChartChard> = (props) => {
  const { title, data } = props || {};
  // const handleSelect = (selectedOption: string) => {
  //   console.log("Selected option:", selectedOption);
  // };
  return (
    <div className="col-50 card-bg p-6">
      <div className="mb-6 flex">
        <div className="card-heading">
          <h2 className="text-default-color">{title}</h2>
        </div>
        <span className="grow"></span>
        {/* <FrequencyDropdown onSelect={handleSelect} /> */}
      </div>
      <div>
        <DonutChart
          highChartOptions={{
            series: [
              {
                type: "pie",
                name: "Risk",
                data,
              },
            ],
          }}
        />
      </div>
    </div>
  );
};
