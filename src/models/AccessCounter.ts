import mongoose, { Schema, Document } from 'mongoose';
import { IAccessCounter } from '../types';

/**
 * Interface que extende Document do Mongoose para o AccessCounter
 */
export interface IAccessCounterDocument extends IAccessCounter, Document {}

/**
 * Interface para métodos estáticos do modelo
 */
interface IAccessCounterModel extends mongoose.Model<IAccessCounterDocument> {
  incrementCounter(): Promise<IAccessCounterDocument>;
  getCurrentCount(): Promise<IAccessCounterDocument | null>;
  resetCounter(): Promise<IAccessCounterDocument>;
}

/**
 * Schema do MongoDB para contador de acessos
 * Implementa um padrão singleton para garantir apenas um contador
 */
const AccessCounterSchema = new Schema<IAccessCounterDocument>(
  {
    count: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'O contador não pode ser negativo'],
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    collection: 'access_counter', // Nome da coleção no MongoDB
  }
);

/**
 * Índices para performance
 */
AccessCounterSchema.index({ lastUpdated: -1 });

/**
 * Middleware para atualizar lastUpdated antes de salvar
 */
AccessCounterSchema.pre('save', function (next) {
  if (this.isModified('count')) {
    this.lastUpdated = new Date();
  }
  next();
});

/**
 * Método estático para incrementar o contador de forma atômica
 * Garante thread-safety e consistência dos dados
 */
AccessCounterSchema.statics.incrementCounter = async function () {
  // Usa findOneAndUpdate com upsert para garantir atomicidade
  const counter = await this.findOneAndUpdate(
    {}, // Busca qualquer documento (deve haver apenas um)
    {
      $inc: { count: 1 }, // Incrementa o contador
      $set: { lastUpdated: new Date() }, // Atualiza timestamp
    },
    {
      new: true, // Retorna o documento atualizado
      upsert: true, // Cria se não existir
      runValidators: true, // Executa validações do schema
    }
  );

  return counter;
};

/**
 * Método estático para obter o contador atual
 */
AccessCounterSchema.statics.getCurrentCount = async function () {
  return await this.findOne({}).lean(); // lean() para melhor performance
};

/**
 * Método estático para resetar o contador (útil para testes)
 */
AccessCounterSchema.statics.resetCounter = async function () {
  return await this.findOneAndUpdate(
    {},
    {
      count: 0,
      lastUpdated: new Date(),
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

/**
 * Método para converter para objeto de resposta
 */
AccessCounterSchema.methods.toResponseObject = function (): { count: number; lastUpdated: Date } {
  return {
    count: this.count,
    lastUpdated: this.lastUpdated,
  };
};

/**
 * Configuração do toJSON para remover campos desnecessários
 */
AccessCounterSchema.set('toJSON', {
  transform: function (doc: any, ret: any) {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

/**
 * Model do AccessCounter
 */
export const AccessCounter = mongoose.model<IAccessCounterDocument, IAccessCounterModel>('AccessCounter', AccessCounterSchema);
