import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface CompanyDocument extends Document {
  companyName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const companySchema = new Schema<CompanyDocument>({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [100, 'Company name must be less than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false 
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'insurance_companies', 
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).password;
      return ret;
    }
  }
});

// Pre-save middleware to hash password
companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
companySchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
companySchema.index({ email: 1 });
companySchema.index({ createdAt: -1 });

export const Company = mongoose.model<CompanyDocument>('Company', companySchema);
