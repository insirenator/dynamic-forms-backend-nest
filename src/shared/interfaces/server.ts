import { UserDto } from '@/repositories/users/users.dto';
import { Request as BaseRequest } from 'express';

/**
 * Custom Request interface that extends the base Request interface from express
 * Provides a bunch of goodies such as 'user', etc
 * */
export interface Request extends BaseRequest {
    /**
     * User details attached to the request
     * */
    user: UserDto;
}
