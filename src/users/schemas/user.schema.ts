import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  /**
   * Tenant/negocio dueño del usuario.
   * Multi-tenant: evita mezclar usuarios entre negocios.
   */
  @Prop({ required: true, index: true })
  tenantId: string;

  /**
   * Email del usuario.
   * Recomendación: único por tenant (no global).
   */
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  /** Hash Argon2 de la contraseña. */
  @Prop({ required: true })
  passwordHash: string;

  /** Nombre visible. */
  @Prop({ trim: true })
  name?: string;

  /**
   * Rol base.
   * Recomendación: restringir a un set conocido.
   */
  @Prop({ default: 'cashier' })
  role: string;

  /**
   * Hash del refresh token actual (rotación).
   * null => logout o no hay sesión activa.
   */
  @Prop({ default: null })
  refreshHash?: string | null;

  /** Permite desactivar cuentas sin borrarlas. */
  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Índice único por tenant: el mismo email puede existir en distintos negocios.
 */
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
