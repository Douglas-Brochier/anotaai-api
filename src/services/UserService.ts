import { User, IUserDocument } from '../models';
import { IUserCreateRequest, IUserResponse } from '../types';
import { Logger } from '../utils';
import { AppError } from '../middleware';

/**
 * Service para gerenciamento de usuários
 * Implementa lógica de negócio e validações
 */
export class UserService {
  /**
   * Cria um novo usuário
   * Valida unicidade do email e hash da senha
   */
  public static async createUser(userData: IUserCreateRequest): Promise<IUserResponse> {
    try {
      Logger.debug('Iniciando criação de usuário', { email: userData.email });

      // Verifica se email já existe
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        Logger.warn('Tentativa de criação com email duplicado', { email: userData.email });
        throw new AppError('Email já está em uso', 409);
      }

      // Cria o usuário (senha será hasheada automaticamente pelo middleware)
      const user = new User({
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
      });

      const savedUser = await user.save();

      Logger.info('Usuário criado com sucesso', { 
        userId: savedUser._id,
        email: savedUser.email 
      });

      return savedUser.toResponseObject();
    } catch (error) {
      Logger.error('Erro ao criar usuário', error);

      if (error instanceof AppError) {
        throw error;
      }

      // Trata erros específicos do MongoDB
      if ((error as any).code === 11000) {
        throw new AppError('Email já está em uso', 409);
      }

      if ((error as any).name === 'ValidationError') {
        const validationErrors = Object.values((error as any).errors)
          .map((err: any) => err.message)
          .join(', ');
        throw new AppError(`Dados inválidos: ${validationErrors}`, 400);
      }

      throw new AppError('Erro interno ao criar usuário', 500);
    }
  }

  /**
   * Busca usuário por ID
   * Retorna dados do usuário sem informações sensíveis
   */
  public static async getUserById(userId: string): Promise<IUserResponse> {
    try {
      Logger.debug('Buscando usuário por ID', { userId });

      const user = await User.findById(userId).lean();

      if (!user) {
        Logger.warn('Usuário não encontrado', { userId });
        throw new AppError('Usuário não encontrado', 404);
      }

      Logger.debug('Usuário encontrado', { userId, email: user.email });

      // Converte para response object removendo dados sensíveis
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt!,
        updatedAt: user.updatedAt!,
      };
    } catch (error) {
      Logger.error('Erro ao buscar usuário por ID', error);

      if (error instanceof AppError) {
        throw error;
      }

      if ((error as any).name === 'CastError') {
        throw new AppError('ID de usuário inválido', 400);
      }

      throw new AppError('Erro interno ao buscar usuário', 500);
    }
  }

  /**
   * Busca usuário por email
   * Usado principalmente para autenticação
   */
  public static async getUserByEmail(email: string): Promise<IUserDocument | null> {
    try {
      Logger.debug('Buscando usuário por email', { email });

      const user = await User.findByEmail(email);

      if (user) {
        Logger.debug('Usuário encontrado por email', { userId: user._id });
      } else {
        Logger.debug('Usuário não encontrado por email', { email });
      }

      return user;
    } catch (error) {
      Logger.error('Erro ao buscar usuário por email', error);
      throw new AppError('Erro interno ao buscar usuário', 500);
    }
  }

  /**
   * Lista usuários com paginação
   * Retorna lista paginada sem informações sensíveis
   */
  public static async listUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: IUserResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      Logger.debug('Listando usuários', { page, limit });

      const skip = (page - 1) * limit;

      // Busca usuários e contagem total em paralelo
      const [users, total] = await Promise.all([
        User.find({})
          .select('-password') // Exclui senha
          .sort({ createdAt: -1 }) // Mais recentes primeiro
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments({}),
      ]);

      const pages = Math.ceil(total / limit);

      const userResponses: IUserResponse[] = users.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt!,
        updatedAt: user.updatedAt!,
      }));

      Logger.debug('Usuários listados com sucesso', { 
        count: users.length, 
        total, 
        page, 
        pages 
      });

      return {
        users: userResponses,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      Logger.error('Erro ao listar usuários', error);
      throw new AppError('Erro interno ao listar usuários', 500);
    }
  }

  /**
   * Atualiza dados do usuário
   * Permite atualizar nome e email (não senha por segurança)
   */
  public static async updateUser(
    userId: string,
    updateData: { name?: string; email?: string }
  ): Promise<IUserResponse> {
    try {
      Logger.debug('Atualizando usuário', { userId, updateData });

      // Se está atualizando email, verifica se não está em uso
      if (updateData.email) {
        const existingUser = await User.findByEmail(updateData.email);
        if (existingUser && (existingUser._id as any).toString() !== userId) {
          throw new AppError('Email já está em uso por outro usuário', 409);
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          ...(updateData.name && { name: updateData.name.trim() }),
          ...(updateData.email && { email: updateData.email.toLowerCase().trim() }),
        },
        {
          new: true, // Retorna documento atualizado
          runValidators: true, // Executa validações
        }
      );

      if (!updatedUser) {
        throw new AppError('Usuário não encontrado', 404);
      }

      Logger.info('Usuário atualizado com sucesso', { userId });

      return updatedUser.toResponseObject();
    } catch (error) {
      Logger.error('Erro ao atualizar usuário', error);

      if (error instanceof AppError) {
        throw error;
      }

      if ((error as any).code === 11000) {
        throw new AppError('Email já está em uso', 409);
      }

      if ((error as any).name === 'ValidationError') {
        const validationErrors = Object.values((error as any).errors)
          .map((err: any) => err.message)
          .join(', ');
        throw new AppError(`Dados inválidos: ${validationErrors}`, 400);
      }

      throw new AppError('Erro interno ao atualizar usuário', 500);
    }
  }

  /**
   * Remove usuário
   * Soft delete seria implementado aqui em um cenário real
   */
  public static async deleteUser(userId: string): Promise<void> {
    try {
      Logger.debug('Removendo usuário', { userId });

      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        throw new AppError('Usuário não encontrado', 404);
      }

      Logger.info('Usuário removido com sucesso', { userId });
    } catch (error) {
      Logger.error('Erro ao remover usuário', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Erro interno ao remover usuário', 500);
    }
  }

  /**
   * Verifica se um usuário existe
   */
  public static async userExists(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).lean();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém estatísticas dos usuários
   */
  public static async getUserStatistics(): Promise<{
    totalUsers: number;
    usersToday: number;
    usersThisWeek: number;
    usersThisMonth: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalUsers, usersToday, usersThisWeek, usersThisMonth] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ createdAt: { $gte: thisWeek } }),
        User.countDocuments({ createdAt: { $gte: thisMonth } }),
      ]);

      return {
        totalUsers,
        usersToday,
        usersThisWeek,
        usersThisMonth,
      };
    } catch (error) {
      Logger.error('Erro ao obter estatísticas de usuários', error);
      throw new AppError('Erro interno ao obter estatísticas', 500);
    }
  }
}
