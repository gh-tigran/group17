import { DataTypes, Model } from 'sequelize';
import md5 from 'md5';
import sequelize from '../services/sequelize';

const { PASSWORD_SECRET, API_URL } = process.env;

class Users extends Model {
  static passwordHash = (password) => md5(md5(password) + PASSWORD_SECRET);
}

Users.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.CHAR(32),
    allowNull: false,
    set(password) {
      if (password) {
        this.setDataValue('password', Users.passwordHash(password));
      }
    },
    get() {
      return undefined;
    },
  },

  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      const avatar = this.getDataValue('avatar');
      if (avatar) {
        return API_URL + avatar;
      }
      const email = md5(this.getDataValue('email').toLowerCase());
      return `https://www.gravatar.com/avatar/${email}?d=robohash`;
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'blocked'),
    allowNull: false,
    defaultValue: 'pending',
  },
  activationToken: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      return undefined;
    },
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: false,
  sequelize,
  tableName: 'users',
  modelName: 'users',
});

export default Users;
