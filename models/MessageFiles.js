import { DataTypes, Model } from 'sequelize';
import sequelize from '../services/sequelize';
import Messages from './Messages';

class MessageFiles extends Model {
}

MessageFiles.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimType: {
    type: DataTypes.STRING,
  },
  size: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  duration: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
}, {
  sequelize,
  tableName: 'message_files',
  modelName: 'message_files',
});

MessageFiles.belongsTo(Messages, {
  foreignKey: 'messageId',
  as: 'message',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

Messages.hasMany(MessageFiles, {
  foreignKey: 'messageId',
  as: 'files',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export default MessageFiles;
