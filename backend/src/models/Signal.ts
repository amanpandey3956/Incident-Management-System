import mongoose, { Schema, Document } from 'mongoose';

export interface ISignal extends Document {
  component_id: string;
  signal_type: string;
  severity: string;
  message: string;
  metadata: Record<string, unknown>;
  work_item_id: string | null;
  received_at: Date;
}

const SignalSchema = new Schema<ISignal>({
  component_id: { type: String, required: true, index: true },
  signal_type: { type: String, required: true },
  severity: { type: String, required: true },
  message: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  work_item_id: { type: String, default: null, index: true },
  received_at: { type: Date, default: Date.now, index: true },
});

export default mongoose.model<ISignal>('Signal', SignalSchema);
