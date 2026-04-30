let signalCount = 0;
let intervalStartTime = Date.now();

export const incrementSignalCount = () => {
  signalCount++;
};

export const startMetricsPrinter = () => {
  setInterval(() => {
    const elapsed = (Date.now() - intervalStartTime) / 1000;
    const tps = (signalCount / elapsed).toFixed(2);
    console.log(`📊 Throughput: ${tps} signals/sec | Total: ${signalCount}`);
    signalCount = 0;
    intervalStartTime = Date.now();
  }, 5000);
};
