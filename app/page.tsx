"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { evaluate } from "mathjs";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

export default function Home() {

  useEffect(() => {
  if (graphType !== "2d") {
    return;
  }

  const parts = equation.split("=");

  if (parts.length !== 2) {
    return;
  }

  const expression = parts[1].trim();

  create2DGraph(expression);
}, [amplitude, frequency]);

  const [equation, setEquation] = useState("y = x^2");
  const [graphType, setGraphType] = useState<"2d" | "3d" | null>(null);

  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);

  const [xGrid, setXGrid] = useState<number[]>([]);
  const [yGrid, setYGrid] = useState<number[]>([]);
  const [zGrid, setZGrid] = useState<number[][]>([]);

  const [graphTitle, setGraphTitle] = useState("");

  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);

  function handleVisualize() {
    try {
      const parts = equation.split("=");

      if (parts.length !== 2) {
        alert("Please enter an equation like y = x^2 or z = x^2 + y^2");
        return;
      }

      const leftSide = parts[0].trim().toLowerCase();
      const expression = parts[1].trim();

      if (leftSide === "y") {
        create2DGraph(expression);
      } else if (leftSide === "z") {
        create3DGraph(expression);
      } else {
        alert("For now, start the equation with y = or z =");
      }
    } catch (error) {
      console.error(error);
      alert("I could not understand that equation.");
    }
  }

  function create2DGraph(expression: string) {
    const xs: number[] = [];
    const ys: number[] = [];

    for (let x = -10; x <= 10; x += 0.1) {
      const y = evaluate(expression, {
        x,
        A: amplitude,
        k: frequency,
      });

      if (typeof y === "number" && Number.isFinite(y)) {
        xs.push(x);
        ys.push(y);
      }
    }

    setXValues(xs);
    setYValues(ys);
    setGraphTitle(equation);
    setGraphType("2d");
  }

  function create3DGraph(expression: string) {
    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[][] = [];

    for (let x = -5; x <= 5; x += 0.25) {
      xs.push(x);
    }

    for (let y = -5; y <= 5; y += 0.25) {
      ys.push(y);
    }

    for (let yIndex = 0; yIndex < ys.length; yIndex++) {
      const row: number[] = [];

      for (let xIndex = 0; xIndex < xs.length; xIndex++) {
        const x = xs[xIndex];
        const y = ys[yIndex];

        const z = evaluate(expression, {
          x,
          y,
          A: amplitude,
          k: frequency,
        });

        if (typeof z === "number" && Number.isFinite(z)) {
          row.push(z);
        } else {
          row.push(NaN);
        }
      }

      zs.push(row);
    }

    setXGrid(xs);
    setYGrid(ys);
    setZGrid(zs);
    setGraphTitle(equation);
    setGraphType("3d");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-3">Visoran</h1>

        <p className="text-gray-600 mb-8">
          Turn equations, formulas, and ideas into interactive visualizations.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="Try: y = 2*sin(3*x)"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
          />

          <button
            onClick={handleVisualize}
            className="bg-black text-white px-6 py-3 rounded-xl"
          >
            Visualize
          </button>
        </div>

        <div className="mb-8 space-y-5">
          <div>
            <label className="block mb-2">
              Amplitude A: {amplitude}
            </label>

            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2">
              Frequency k: {frequency}
            </label>

            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {graphType === "2d" && (
          <Plot
            data={[
              {
                x: xValues,
                y: yValues,
                type: "scatter",
                mode: "lines",
                name: graphTitle,
              },
            ]}
            layout={{
              title: {
                text: graphTitle,
              },
              xaxis: {
                title: {
                  text: "x",
                },
              },
              yaxis: {
                title: {
                  text: "y",
                },
              },
              autosize: true,
            }}
            style={{
              width: "100%",
              height: "500px",
            }}
            useResizeHandler
          />
        )}

        {graphType === "3d" && (
          <Plot
            data={[
              {
                x: xGrid,
                y: yGrid,
                z: zGrid,
                type: "surface",
              },
            ]}
            layout={{
              title: {
                text: graphTitle,
              },
              autosize: true,
              scene: {
                xaxis: {
                  title: {
                    text: "x",
                  },
                },
                yaxis: {
                  title: {
                    text: "y",
                  },
                },
                zaxis: {
                  title: {
                    text: "z",
                  },
                },
              },
            }}
            style={{
              width: "100%",
              height: "600px",
            }}
            useResizeHandler
          />
        )}
      </div>
    </main>
  );
}