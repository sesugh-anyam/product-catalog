import { Schema, model, Document } from 'mongoose';

export interface IStockHistory extends Document {
  productId: Schema.Types.ObjectId;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  type: 'add' | 'subtract' | 'set';
  reason?: string;
  createdAt: Date;
}

const stockHistorySchema = new Schema<IStockHistory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    changeAmount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['add', 'subtract', 'set'],
      required: true,
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

stockHistorySchema.index({ productId: 1, createdAt: -1 });

export const StockHistoryModel = model<IStockHistory>('StockHistory', stockHistorySchema);
