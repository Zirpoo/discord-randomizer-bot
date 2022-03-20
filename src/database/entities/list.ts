import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";

@Entity()
export class List {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.lists)
    user: User;

    @Column()
    name: string;

    @Column()
    items: string;
}
