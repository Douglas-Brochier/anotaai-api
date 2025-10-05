import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserResponse } from '../types';
import { config } from '../config/environment';

/**
 * Interface que extende Document do Mongoose para o User
 */
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toResponseObject(): IUserResponse;
}

/**
 * Interface para métodos estáticos do modelo
 */
interface IUserModel extends mongoose.Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  emailExists(email: string): Promise<boolean>;
}

/**
 * Schema do MongoDB para usuários
 * Implementa validação robusta e segurança
 */
const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [100, 'Nome não pode exceder 100 caracteres'],
      match: [/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Email deve ter um formato válido',
      ],
      maxlength: [255, 'Email não pode exceder 255 caracteres'],
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
      maxlength: [128, 'Senha não pode exceder 128 caracteres'],
      validate: {
        validator: function (password: string): boolean {
          // Senha deve conter pelo menos: 1 maiúscula, 1 minúscula, 1 número
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password);
        },
        message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
      },
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    collection: 'users', // Nome da coleção no MongoDB
  }
);

/**
 * Índices para performance e consistência
 */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });

/**
 * Middleware para hash da senha antes de salvar
 * Só executa o hash se a senha foi modificada
 */
UserSchema.pre('save', async function (next) {
  // Se a senha não foi modificada, pula o hash
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Gera o hash da senha usando bcrypt
    const salt = await bcrypt.genSalt(config.bcrypt.rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Método para comparar senha fornecida com hash armazenado
 */
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * Método para converter para objeto de resposta (sem senha)
 */
UserSchema.methods.toResponseObject = function (): IUserResponse {
  return {
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Método estático para buscar usuário por email
 */
UserSchema.statics.findByEmail = async function (email: string) {
  return await this.findOne({ email: email.toLowerCase() });
};

/**
 * Método estático para verificar se email já existe
 */
UserSchema.statics.emailExists = async function (email: string) {
  const user = await this.findOne({ email: email.toLowerCase() }).lean();
  return !!user;
};

/**
 * Configuração do toJSON para remover campos sensíveis
 */
UserSchema.set('toJSON', {
  transform: function (doc: any, ret: any) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

/**
 * Configuração do toObject para remover campos sensíveis
 */
UserSchema.set('toObject', {
  transform: function (doc: any, ret: any) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

/**
 * Middleware para tratar erros de duplicata de email
 */
UserSchema.post('save', function (error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern?.email) {
      next(new Error('Email já está em uso'));
    } else {
      next(new Error('Dados duplicados'));
    }
  } else {
    next(error);
  }
});

/**
 * Model do User
 */
export const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
