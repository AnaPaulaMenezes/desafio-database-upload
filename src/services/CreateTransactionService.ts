import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);
    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('Insuficient balence', 400);
    }

    let catetorysTrasaction = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!catetorysTrasaction) {
      catetorysTrasaction = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(catetorysTrasaction);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: catetorysTrasaction,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
