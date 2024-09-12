const generationType = {
  solar: "Solar",
  wind: "Wind",
  hydro: "Hydro",
  gas: "Gas",
  coal: "Coal",
  biomass: "Biomass",
  nuclear: "Nuclear",
  pumpedStorage: "Pumped Storage",
  //imports: "Imports & Exports",
};

const generationColor: Record<string, string> = {
  solar: "bg-amber-300",
  wind: "bg-sky-400",
  hydro: "bg-sky-700",
  gas: "bg-pink-600",
  coal: "bg-pink-600",
  biomass: "bg-amber-500",
  nuclear: "bg-green-500",
  pumpedStorage: "bg-rose-500",
};

const numberFormatter = new Intl.NumberFormat("en-GB", {
  style: "decimal",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-GB", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "numeric",
});

const daysFromToday = (n: number) => {
  let d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

export default async function Home() {
  const dateFrom = daysFromToday(-1).toISOString();
  const dateTo = new Date().toISOString();
  const groupBy = "30m";
  const ts = `${Date.now()}`;

  let data = await fetch(
    `https://drax-production.herokuapp.com/api/1/generation-mix?date_from=${dateFrom}&date_to=${dateTo}&group_by=${groupBy}&_ts=${ts}`,
    { next: { revalidate: 30 * 60 } }
  );

  let generationMix = await data.json();

  let response = generationMix[generationMix.length - 1].value;

  let start = Date.parse(generationMix[generationMix.length - 1].start);
  let end = Date.parse(generationMix[generationMix.length - 1].end);

  let total = Object.keys(generationType)
    .map((type) => response[type])
    .reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

  return (
    <main className="container mx-auto px-4">
      <h1 className="text-3xl font-extrabold pt-4">National Grid</h1>
      <h2 className="text-2xl font-bold">Generation mix</h2>
      <h3 className="text-lg text-gray-500 pb-4">{`${dateFormatter.format(
        end
      )} ${timeFormatter.format(start)}-${timeFormatter.format(end)}`}</h3>
      <div className="">
        <ul className="space-y-2">
          {Object.entries(generationType).map(([type, label]) => {
            const value = response[type];
            const percentage = value / total;

            return (
              <li key={type}>
                <div className="flex justify-between">
                  <span className="">{label}</span>
                  <div className="relative">
                    <span className="absolute right-24">
                      {numberFormatter.format(value)}
                      <span className="text-gray-500">GW</span>
                    </span>
                    <span className="absolute right-0">
                      {numberFormatter.format(100 * percentage)}
                      <span className="text-gray-500">%</span>
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-300 overflow-hidden relative rounded-full">
                  <div
                    className={`transition-all ${
                      generationColor[type] ?? "bg-slate-900"
                    } flex-1 w-full h-full`}
                    style={{
                      transform: `translateX(${-100 * (1 - percentage)}%)`,
                    }}
                  ></div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
