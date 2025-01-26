import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HasherService {
    private ROUNDS = 10;

    hash(text: string) {
        return bcrypt.hash(text, this.ROUNDS);
    }

    compare(text: string, hash: string) {
        return bcrypt.compare(text, hash);
    }
}
