import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Users from './Users';

class Messages extends Model {
}

Messages.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  seen: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('text', 'voice', 'video', 'emoji'),
    allowNull: false,
    defaultValue: 'text',
  },
}, {
  sequelize,
  tableName: 'messages',
  modelName: 'messages',
});

Messages.belongsTo(Users, {
  foreignKey: 'from',
  as: 'userFrom',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Users.hasMany(Messages, {
  foreignKey: 'from',
  as: 'messagesFrom',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Messages.belongsTo(Users, {
  foreignKey: 'to',
  as: 'userTo',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Users.hasMany(Messages, {
  foreignKey: 'to',
  as: 'messagesTo',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export default Messages;
